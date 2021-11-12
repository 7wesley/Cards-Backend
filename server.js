/**
 * Handles what happens for each gameroom. This includes starting a match,
 *  connecting a player to the gameroom, disconnecting them, and finding
 *  which player's turn it is to move.
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

var db = require("./firebaseFunctions");
var express = require("express");
var app = express();
var server = app.listen(5000);
const io = require("socket.io")(server);
var GameLogic = require("./gameLogic");
const Blackjack = require("./cards/Blackjack");
const War = require("./cards/War");
let logic = new GameLogic(io);

io.on("connection", (socket) => {
  /**
   * Checks if the room the socket was apart of has 0 players.
   * If so, the room is deleted, else, the player is removed.
   */
  socket.on("disconnect", async () => {
    if (!io.sockets.adapter.rooms.get(socket.room))
      await db.deleteRoom(socket.room);
    else {
      //You don't need to remove the player if the room is deleted
      let game = io.sockets.adapter.rooms.get(socket.room).game;
      await db.removePlayer(socket.room, socket.uid);
      if (game && game.inProgress()) {
        game.removePlayer(socket.uid);
        //Refresh hands after player leaves
        io.to(socket.room).emit("update-hands", game.displayPlayers());
        //Only go to the next turn if current turn user == disconnected user
        if (game.isTurn(socket.uid))
          io.sockets.adapter.rooms.get(socket.room).timerEnd = true;
      }
    }
    console.log(`Disconnected: ${socket.id}`);
  });

  /**
   * Every time a new socket is connected, it is added to
   * the room that is passed in. If the room has met its player
   * quota, the countdown function will be called.
   * @param {*} room - The room the socket is part of
   * @param {*} uid - The uid of the socket that has just joined the room
   */
  socket.on("join", async (room, uid) => {
    //Adding player
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
    await db.addPlayer(room, uid);

    socket.room = room;
    socket.uid = uid;
    socket.game = await db.queryGame(room);

    //The last player is the host socket that runs the startup code
    if (await db.checkFull(room)) {
      countdown(room);
    }
  });

  /**
   * Begins dealing the initial cards to each player corresponding
   * to the type of the game. Cards are dealt in 1 second intervals.
   * @param {*} room - The room the socket is part of
   */
  const start = async (room) => {
    const playerList = await db.queryUsers(room);
    let game;

    if (socket.game == "Blackjack") {
      game = new Blackjack(playerList);
    } else {
      game = new War(playerList);
    }
    io.sockets.adapter.rooms.get(room).game = game;
    io.sockets.adapter.rooms.get(room).timerEnd = false;

    game.initialDeal();
    console.log(game.displayPlayers())
    io.to(room).emit("update-hands", game.displayPlayers());
    
    turns(game, room);
  };


  /**
   * Starts a countdown that will be displayed on the waiting
   * screen, and then triggers the start() function once the
   * timer has reached 0.
   * @param {*} room - The room the socket is part of
   */
  const countdown = (room) => {
    var seconds = 1;
    var gameCountdown = setInterval(() => {
      io.to(room).emit("countdown", seconds);
      seconds--;
      if (seconds == 0) {
        clearInterval(gameCountdown);
        start(room);
      }
    }, 1000);
  };

  /**
   * Asks the room's game object who's turn it is and emits
   * the appropriate information to each player depending
   * on what the game returns.
   * @param {*} room - The room the socket is part of
   */
  const turns = async (game, room) => {
    let match = {};
    let player;

    for (const client of io.sockets.adapter.rooms.get(room))
      match[io.sockets.sockets.get(client).uid] = client;

    while (game.inProgress()) {
      try {
        player = game.nextTurn();
        //Handles when the last player to make a move has left
        /*
        if (player.getLastCardFlipped() != null) {
          await gameHandler(match[player.id], game);
        }
        */

        io.to(room).emit("curr-turn", player.id);
        io.to(match[player.id]).emit("your-turn", game.getPrompt());
        await turnTimer(room, game);
        io.to(socket.room).emit("update-hands", game.displayPlayers());
        await gameHandler(match[player.id], game);
      } catch (e) {
        console.log(e);
      }
    }
    io.to(socket.room).emit("winners", game.findWinners());
    handleGameEnd(socket.room);
  };

  /**
   * Creates a countdown timer for 20 seconds. This is used to keep
   * track of how much time a user has left on a specific turn.
   * @param {*} room - The room the socket is part of
   * @param {*} game - The game instance of the current room
   * @returns
   */
  const turnTimer = (room, game) => {
    let currRoom = io.sockets.adapter.rooms.get(room);

    return new Promise((resolve) => {
      let seconds = 40;

      const timer = setInterval(() => {
        seconds % 2 == 0 && io.to(room).emit("timer", seconds / 2);
        if (seconds == 0 || (currRoom && currRoom.timerEnd)) {
          //Reset timer if it hits 0
          io.to(room).emit("timer", 20);
          if (currRoom) {
            currRoom.timerEnd = false;
          }
          seconds == 0 && game.makeMove("pass");
          resolve();
          clearInterval(timer);
        }
        seconds--;
      }, 500);
    });
  };

  /**
   * Takes the choice from a player's move, sets it to the
   * gameChoice variable, and then ends the player's turn.
   */
  socket.on("player-move", (choice) => {
    let game = io.sockets.adapter.rooms.get(socket.room).game;

    game.makeMove(choice);
    io.sockets.adapter.rooms.get(socket.room).timerEnd = true;
  });

  /**
   * Detects if a user decides to play again and increments the room's
   * playAgain counter and resets states that were saved from the
   * previous game.
   */
  socket.on("play-again", async () => {
    socket.playAgain = true;
    let room = io.sockets.adapter.rooms.get(socket.room);
    //cannot do let playAgainCnt = room.playAgainCnt
    //primitives are cloned instead of referenced
    room.playAgainCnt++;
    //Setting values back to their initial states
    io.to(socket.id).emit("winners", null);
    io.to(socket.id).emit("update-hands", []);
    io.to(socket.id).emit("countdown", null);
    //Only runs if all players decide to play again
    if (room.playAgainCnt == (await db.queryMax(socket.room))) {
      await db.setStatus(socket.room, "in-progress");
      countdown(socket.room);
    }
  });

  /**
   * Determines what the current game is and then calls the
   * appropriate method from the gameLogic instance.
   * @param {*} id - The socket id of the current turn
   * @param {*} game - The game instance of the current room
   */
  const gameHandler = async (id, game) => {
    const currSocket = io.sockets.sockets.get(id);
    switch (currSocket.game) {
      case "Blackjack":
        await logic.blackjack(currSocket, game);
        break;
      case "War":
        await logic.war(currSocket, game);
        break;
    }
  };

  /**
   * Creates a countdown timer for each socket in the room and
   * updates the room status to 'waiting' if at least one user decides
   * not to play again.
   * @param {*} room - The room the socket is part of
   */
  const handleGameEnd = async (room) => {
    let currRoom = io.sockets.adapter.rooms.get(room);

    if (currRoom) {
      let promises = [];
      currRoom.playAgainCnt = 0;
      for (const client of currRoom)
        promises.push(playAgainTimer(io.sockets.sockets.get(client)));
      //waiting for all the timers to finish executing
      await Promise.all(promises);
      //only display the room to the public if a player has left
      if (currRoom.playAgainCnt != (await db.queryMax(room))) {
        await db.setStatus(room, "waiting");
      }
    }
  };

  /**
   * Generates a 20 second timer used for the ending screen
   * and emits it to the client paramter in 1 second intervals.
   * @param {*} client - The client to emit the timer to
   * @returns A promise that will resolve once the timer
   * reaches 0
   */
  const playAgainTimer = (client) => {
    return new Promise((resolve) => {
      let seconds = 20;

      const timer = setInterval(() => {
        io.to(client.id).emit("timer", seconds);
        //if the client disconnected, the timer reached 0, or the client played again
        if (
          !io.sockets.sockets.get(client.id) ||
          seconds == 0 ||
          client.playAgain
        ) {
          seconds == 0 && client.disconnect();
          client.playAgain = false;
          resolve();
          clearInterval(timer);
        }
        seconds--;
      }, 1000);
    });
  };
});

//static files
app.use(express.static("public"));
