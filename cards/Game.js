/**
 * Creates and manipulates the board the players play on
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

var Deck = require("./Deck");
var Player = require("./Player");

class Game {
  constructor(players) {
    this.players = [];
    for (const playerName of players) {
      this.players.push(new Player(playerName));
    }
    this.deck = new Deck();
    this.turn = null;
  }

  removePlayer(uid) {
    this.players = this.players.filter((player) => player.id !== uid);
  }

  getPlayersFormatted() {
    let players = [];
    for (const player of this.players) {
      players.push(player.toString());
    }
    return players;
  }

  inProgress() {
    const playing = this.players.filter(
      (player) => player.getStatus() === "playing"
    );
    return playing.length !== 0;
  }

  isTurn(uid) {
    return this.turn.getId() === uid;
  }

  getPlayer(uid) {
    return this.players.find((player) => player.id === uid);
  }
}

module.exports = Game;
