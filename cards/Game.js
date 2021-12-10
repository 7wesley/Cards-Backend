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

  filterBanks() {
    this.players.forEach((player, index) => {
      if (player.getBank() == 0) {
        this.players.splice(index, 1);
      }
    });
  }

  resetCurrTurn() {
    this.io.to(this.room).emit("curr-turn", "placeholder");
  }

  async emitPlayersDelay(players) {
    this.io.to(this.room).emit("update-hands", players);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

module.exports = Game;
