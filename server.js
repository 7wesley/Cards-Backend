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
const Player = require("./cards/Player");
const Dealer = require("./cards/Dealer");
var logic = new GameLogic(io);

var timers = {};

io.on("connection", (socket) => {
  /**
   * Checks if the room the socket was apart of has 0 players.
   * If so, the room is deleted, else, the player is removed.
   */
  socket.on("disconnect", async () => {
    const room = socket.room;

    if (!getRoom(room)) {
      await db.deleteRoom(room);
    } else {
      await db.removePlayer(room, socket.uid);
      if (getGame(room) && getGame(room).inProgress()) {
        getGame(room).removePlayer(socket.uid);
        //Refresh hands after player leaves
        io.to(room).emit("update-hands", getGame(room).displayPlayers());
        //Only go to the next turn if current turn user == disconnected user
        if (getGame(room).isTurn(socket.uid)) {
          clearInterval[room][socket.id];
        }
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
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
    await db.addPlayer(room, uid);

    socket.room = room;
    socket.uid = uid;
    socket.game = await db.queryGame(room);

    if (await db.checkFull(room)) {
      start(room);
    }
  });

  /**
   * Begins dealing the initial cards to each player corresponding
   * to the type of the game. Cards are dealt in 1 second intervals.
   * @param {*} room - The room the socket is part of
   */
  const start = async (room) => {
    const playerList = await db.queryRoom(room, "players");
    const bank = await db.queryRoom(room, "bank");
    let game;

    if (socket.game == "Blackjack") {
      game = new Blackjack(playerList, bank);
    } else {
      game = new War(playerList);
    }
    getRoom(room).game = game;
    io.to(room).emit("update-hands", game.displayPlayers());
    getBets(room);
  };

  const getBets = async (room) => {
    timers[room] = {};
    const sockets = await io.in(room).fetchSockets();

    for (const socket of sockets) {
      betTimer(socket);
    }
  };

  const betTimer = async (client) => {
    let seconds = 20;
    timers[client.room][client.id] = setInterval(() => {
      seconds--;
      io.to(client.id).emit("timer", seconds);
      if (seconds == 0) {
        clearInterval(timers[client.room][client.id]);
        delete timers[socket.room][socket.id];
      }
    }, 1000);
  };

  socket.on("player-bet", (bet) => {
    getGame(socket.room).getPlayer(socket.uid).setBet(bet);

    clearInterval(timers[socket.room][socket.id]);
    delete timers[socket.room][socket.id];
    io.to(socket.room).emit(
      "update-hands",
      getGame(socket.room).displayPlayers()
    );

    if (Object.keys(timers[socket.room]).length === 0) {
      getGame(socket.room).initialDeal();
      turn(socket.room);
    }
  });

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
  const turn = (room) => {
    io.to(socket.room).emit("update-hands", getGame(room).displayPlayers());
    io.to(room).emit("timer", 20);

    if (getGame(room).inProgress()) {
      try {
        let player = getGame(room).nextTurn();
        /*
        if (player.getLastCardFlipped() != null) {
          await gameHandler(match[player.id], game);
        }
        */

        io.to(room).emit("curr-turn", player.id);
        if (player instanceof Dealer) {
          getGame(room).dealerTurn();
          turn(room);
        } else {
          turnTimer(room);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      handleGameEnd(room);
    }
  };

  /**
   * Creates a countdown timer for 20 seconds. This is used to keep
   * track of how much time a user has left on a specific turn.
   * @param {*} room - The room the socket is part of
   * @param {*} game - The game instance of the current room
   * @returns
   */
  const turnTimer = async (room) => {
    let seconds = 20;

    timers[room] = setInterval(() => {
      seconds--;
      io.to(room).emit("timer", seconds);
      if (seconds == 0) {
        getGame(room).defaultMove();
        clearInterval(timers[room]);
        turn(room);
      }
    }, 1000);
  };

  /**
   * Takes the choice from a player's move, sets it to the
   * gameChoice variable, and then ends the player's turn.
   */
  socket.on("player-move", (choice) => {
    getGame(socket.room).makeMove(choice);
    clearInterval(timers[socket.room]);

    turn(socket.room);
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
    io.to(room).emit("results", getGame(room).getResults());
    await new Promise((resolve) => setTimeout(resolve, 4000));
    getGame(room).checkBanks();

    //Reset values
    io.to(room).emit("curr-turn", null);
    delete timers[room];
    io.to(room).emit("results", null);
    getGame(room).resetGame();
    io.to(socket.room).emit("update-hands", getGame(room).displayPlayers());

    //Start again
    getBets(room);
  };

  const getRoom = (room) => {
    return io.sockets.adapter.rooms.get(room);
  };

  const getGame = (room) => {
    return io.sockets.adapter.rooms.get(room).game;
  };

  const getSocket = (uid, room) => {
    for (const client of io.sockets.adapter.rooms.get(room))
      return io.sockets.sockets.get(client);
  };
});

//static files
app.use(express.static("public"));
