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

  getPlayersFormatted() {
    let players = [];
    for (const player of this.players) {
      players.push(player);
    }
    return players;
  }

  inProgress() {
    let playingSize = this.players.filter(
      (player) => player.getStatus() === "playing"
    ).length;
    return playingSize !== 0;
  }

  isTurn(uid) {
    return this.turn.getId() === uid;
  }

  getPlayer(uid) {
    return this.players.find((player) => player.id === uid);
  }

  resetGame() {
    for (const player of this.players) {
      player.resetFields();
    }
    this.deck = new Deck();
  }

  checkBanks() {
    this.players.forEach((player, index) => {
      if (player.getBank() == 0) {
        this.players.splice(index, 1);
      }
    });
  }

  async emitPlayersDelay() {
    this.io.to(this.room).emit("update-hands", this.players);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

module.exports = Game;
