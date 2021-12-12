/**
 * Creates and manipulates the board the players play on
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

var Deck = require("./Deck");
var Player = require("./Player");

class Game {
  constructor(io, room, players, bank) {
    this.io = io;
    this.room = room;
    this.players = [];
    this.deck = new Deck();
    this.turn = null;
    let player;

    for (const playerName of players) {
      player = new Player(playerName);
      player.updateBank(bank);
      this.players.push(player);
    }
  }

  removePlayer(uid) {
    this.players = this.players.filter((player) => player.id !== uid);
  }

  inProgress() {
    let playingSize = this.players.filter(
      (player) => player.getStatus() === "playing"
    ).length;
    return playingSize !== 0;
  }

  getPlayer(uid) {
    return this.players.find((player) => player.getId() === uid);
  }

  resetGame() {
    for (const player of this.players) {
      player.resetFields();
    }
    this.deck = new Deck();
  }

  async filterBanks() {
    const sockets = await this.io.in(this.room).fetchSockets();

    for (const socket of sockets) {
      const player = this.players.find((p) => p.id === socket.uid);
      if (player.getBank() === 0) {
        this.players = this.players.filter((p) => p.id !== socket.uid);
        socket.leave(this.room);
      }
    }
  }

  resetCurrTurn() {
    this.io.to(this.room).emit("curr-turn", "placeholder");
  }

  async emitPlayers(players, time = 0) {
    this.io.to(this.room).emit("update-hands", players);
    await new Promise((resolve) => setTimeout(resolve, time));
  }

  async emitResults(players, prompt = "", time = 0) {
    this.io.to(this.room).emit("results", { prompt: prompt, winners: players });
    await new Promise((resolve) => setTimeout(resolve, time));
    this.io.to(this.room).emit("results", null);
  }
}

module.exports = Game;
