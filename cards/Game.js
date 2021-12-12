/**
 * Holds the logic for manipulating a game that all game
 * types can utilize
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 12/12/2021
 */

var Deck = require("./Deck");
var Player = require("./Player");

class Game {
  /**
   * Represents a game containing methods all game types can
   * make use of
   * @constructor
   */
  constructor(io, room, players, bank) {
    this.io = io;
    this.room = room;
    this.players = [];
    this.deck = new Deck();
    this.turn = null;

    for (let player of Object.values(players)) {
      player = new Player(player.username, player.image);
      player.updateBank(bank);
      this.players.push(player);
    }
  }

  /**
   * Removes a player by id from the game
   * @param {*} uid - The id of the user to be removed
   */
  removePlayer(uid) {
    this.players = this.players.filter((player) => player.id !== uid);
  }

  /**
   * Generic method to determine if game is still in progress
   * @returns - True if there are players with "playing" status,
   * else false
   */
  inProgress() {
    let playingSize = this.players.filter(
      (player) => player.getStatus() === "playing"
    ).length;
    return playingSize !== 0;
  }

  /**
   * Gets a player by their id
   * @param {*} uid - The id of the player being searched for
   * @returns - The player with the passed in id
   */
  getPlayer(uid) {
    return this.players.find((player) => player.getId() === uid);
  }

  /**
   * Generic method for setting a game back to its starting state
   */
  resetGame() {
    for (const player of this.players) {
      player.resetFields();
    }
    this.deck = new Deck();
  }

  /**
   * Finds all players who have no money left and removes
   * them from the game and from the room.
   */
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

  /**
   * Resets the turn to a placeholder value
   */
  resetCurrTurn() {
    this.io.to(this.room).emit("curr-turn", "placeholder");
  }

  /**
   * Emits the players to the current room
   * @param {*} players - Players to be emitted
   * @param {*} time - The time to wait after emitting
   */
  async emitPlayers(players, time = 0) {
    this.io.to(this.room).emit("update-hands", players);
    await new Promise((resolve) => setTimeout(resolve, time));
  }

  /**
   * Emits the results to the current room
   * @param {*} players - Players who won
   * @param {*} prompt - Message to be sent with results
   * @param {*} time - The time to wait after emitting
   */
  async emitResults(players, prompt = "", time = 0) {
    this.io.to(this.room).emit("results", { prompt: prompt, winners: players });
    await new Promise((resolve) => setTimeout(resolve, time));
    this.io.to(this.room).emit("results", null);
  }
}

module.exports = Game;
