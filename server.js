/**
 * Server logic for handling sockets joining, starting,
 * and leaving games.
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 12/12/2021
 */

var db = require("./firebaseFunctions");
var express = require("express");
var app = express();
var server = app.listen(5000);
const io = require("socket.io")(server);
const Blackjack = require("./cards/Blackjack");
const War = require("./cards/War");
const Dealer = require("./cards/Dealer");

var timers = {};

io.on("connection", (socket) => {
  /**
   * Listens for a new socket connection and then adds them
   * to the room.
   * @param {*} room - The room of the socket
   * @param {*} uid - The uid of the socket
   * @param {*} image - The image of the socket
   */
  socket.on("join", async (room, uid, image) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    try {
      socket.join(room);
      await db.addPlayer(room, uid, image);

      socket.room = room;
      socket.uid = uid;
      socket.game = await db.queryGame(room);

      if (await db.checkFull(room)) {
        start(room);
      }
    } catch (e) {
      console.log(e);
    }
  });

  /**
   * Listens for a socket's bet. Their timer is then
   * subsequently cleared and the game is updated with their bet.
   * @param {*} bet - The bet the socket makes
   */
  socket.on("player-bet", (bet) => {
    const game = getGame(socket.room);
    try {
      game.getPlayer(socket.uid).setBet(bet);

      clearInterval(timers[socket.room][socket.id]);
      delete timers[socket.room][socket.id];
      io.to(socket.room).emit("update-hands", game.displayPlayers());

      startGame(socket.room);
    } catch (e) {
      console.log(e);
    }
  });

  /**
   * Listens for a socket's move. Their timer is then
   * subsequently cleared, a move is made in the game with their
   * choice, and the next turn is started.
   * @param {*} choice - The choice the socket makes
   */
  socket.on("player-move", async (choice) => {
    try {
      clearInterval(timers[socket.room]);
      await getGame(socket.room).makeMove(choice);
      turn(socket.room);
    } catch (e) {
      console.log(e);
    }
  });

  /**
   * Listens for a chat message from a socket and then emits it
   * to all the other sockets in the room
   * @param {*} msg - The message the socket sent
   */
  socket.on("send-message", async (msg) => {
    socket.broadcast.to(socket.room).emit("chat-message", msg);
  });

  /**
   * Listens for a socket disconnecting. If they are no players in the room
   * after they disconnect, the room is deleted from the database.
   */
  socket.on("disconnect", async () => {
    const room = socket.room;
    const game = getGame(room);

    try {
      if (!getRoom(room)) {
        await db.deleteRoom(room);
      } else {
        await db.removePlayer(room, socket.uid);
        if (game.inProgress()) {
          game.removePlayer(socket.uid);
          io.to(room).emit("update-hands", game.displayPlayers());

          if (timers[room] && !timers[room][socket.id]) {
            clearInterval(timers[room]);
            turn(room);
          } else if (timers[room] && timers[room][socket.id]) {
            clearInterval(timers[socket.room][socket.id]);
            delete timers[socket.room][socket.id];
            startGame(room);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }

    console.log(`Disconnected: ${socket.id}`);
  });

  /**
   * Begins the game by creating a new instance of Game and then
   * getting the player bets
   * @param {*} room - The room the socket is part of
   */
  const start = async (room) => {
    const playerList = await db.queryRoom(room, "players");
    const bank = await db.queryRoom(room, "bank");
    let game;

    if (socket.game == "Blackjack") {
      game = new Blackjack(io, room, playerList, bank);
    } else {
      game = new War(io, room, playerList, bank);
    }

    getRoom(room).game = game;
    io.to(room).emit("update-hands", game.displayPlayers());
    getBets(room);
  };

  /**
   * Generates a bet timer for each socket in the room
   * @param {*} room - The room the socket is part of
   */
  const getBets = async (room) => {
    timers[room] = {};
    const sockets = await io.in(room).fetchSockets();

    for (const socket of sockets) {
      betTimer(socket);
    }
  };

  /**
   * A timer for player bets which is emitted every second
   * @param {*} client - The socket to emit the timer to
   */
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

  /**
   * Represents a single turn. Checks if the game is in progress, and
   * if so finds whose turn it is and emits it to the room. If not in
   * progress, calls method for handling the end of the game
   * @param {*} room - The room the socket is part of
   */
  const turn = async (room) => {
    io.to(room).emit("update-hands", getGame(room).displayPlayers());
    io.to(room).emit("timer", 20);

    if (getGame(room).inProgress()) {
      let player = getGame(room).nextTurn();

      io.to(room).emit("curr-turn", player.id);
      if (player instanceof Dealer) {
        await getGame(room).dealerTurn();
        turn(room);
      } else {
        turnTimer(room);
      }
    } else {
      handleGameEnd(room);
    }
  };

  /**
   * Starts the game by dealing out the initial cards and
   * starting the first turn
   * @param {*} room - The room the socket is part of
   */
  const startGame = (room) => {
    if (Object.keys(timers[room]).length === 0) {
      getGame(room).initialDeal();
      turn(room);
    }
  };

  /**
   * Creates a countdown timer for 20 seconds. Keeps
   * track of how much time a user has left on a specific turn.
   * @param {*} room - The room the socket is part of
   * @returns
   */
  const turnTimer = async (room) => {
    let seconds = 20;

    timers[room] = setInterval(() => {
      seconds--;
      io.to(room).emit("timer", seconds);
      if (getGame(room) && seconds == 0) {
        getGame(room).defaultMove();
        clearInterval(timers[room]);
        turn(room);
      }
    }, 1000);
  };

  /**
   * Finds the winners of the game, emits it to the room, and
   * then starts a new game by asking for players bets.
   * @param {*} room - The room the socket is part of
   */
  const handleGameEnd = async (room) => {
    const results = getGame(room).getResults();
    io.to(room).emit("results", { update: true, ...results });
    await new Promise((resolve) => setTimeout(resolve, 4000));
    getGame(room).filterBanks();

    //Reset values
    io.to(room).emit("curr-turn", null);
    delete timers[room];
    io.to(room).emit("results", null);
    getGame(room).resetGame();
    io.to(socket.room).emit("update-hands", getGame(room).displayPlayers());

    //Start again
    getBets(room);
  };

  /**
   * Gets the room from a room name
   * @param {*} room - The room name
   * @returns
   */
  const getRoom = (room) => {
    return io.sockets.adapter.rooms.get(room);
  };

  /**
   * Gets the game in a room from the room name
   * @param {*} room - The room name
   * @returns
   */
  const getGame = (room) => {
    if (getRoom(room)) {
      return getRoom(room).game;
    }
    return null;
  };
});

//static files
app.use(express.static("public"));
