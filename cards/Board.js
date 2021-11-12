/**
 * Creates and manipulates the board the players play on
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

var Deck = require("./Deck");
var Player = require("./Player");
var Blackjack = require("./Blackjack");
var War = require("./War");

class Board {
  constructor(game, players) {
    this.deck = new Deck();
    this.game = game;
    this.players = [];
    for (const playerName of players) {
      this.players.push(new Player(playerName));
    }
    this.startGame();
  }

  /**
   * Begins the game by creating an instance matching the local
   * game field.
   */
  startGame() {
    if (this.game === "Blackjack") {
      this.game = new Blackjack(this.deck, this.players);
    } else if (this.game === "War") {
      this.game = new War(this.deck);
    }
  }

  getGame() {
    return this.game;
  }

  /**
   * Returns the players field
   * @returns - The players field
   */
  getPlayers() {
    return this.players;
  }

  /**
   * Determines if a user is still part of the game by checking their
   * status.
   * @param {*} uid - The user who's status is being checked
   * @returns - True if the user's status is 'playing', otherwise false
   */
  isPlaying(uid) {
    let player = this.players.find((player) => player.id === uid);
    return player && player.getStatus() === "playing";
  }

  /**
   * Checks if the game still has any players left
   * @returns - True if there is a user who's status is still 'playing',
   * otherwise false
   */
  inProgress() {
    let playing = null;

    if (this.game.gameType == "Blackjack") {
      playing = this.players.filter(
        (player) => player.getStatus() === "playing"
      );
      return playing.length !== 0;
    } else if (this.game.gameType == "War") {
      let playersLost = this.players.filter(
        (player) => player.getStatus() === "noCards"
      );

      //If there is only 1 player with cards, then the game is not in progress
      return !(playersLost.length + 1 == this.players.length);
    }
  }

  /**
   * Finds if all the players of this game have made a move
   * @returns true if all plays have moved this turn, false otherwise
   */
  ifAllPlayersMoved() {
    // console.log("Board: ifAllPlayersMoved()")
    let allPlayersMadeMove = true;
    for (let i = 0; i < this.players.length; i++) {
      // console.log("War: players[i].id: "+players[i].id)
      // console.log("War: players[i].getIfMadeMove(): "+players[i].getIfMadeMove())

      if (this.players[i].getIfMadeMove() == false) {
        allPlayersMadeMove = false;
      }
    }
    return allPlayersMadeMove;
  }

  /**
   * Resets all the player's lastCardFlipped
   */
  resetLastCardFlipped() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].resetLastCardFlipped();
    }
  }

  /**
   * Gets the winner of a War match
   * @returns the player that won the round
   */
  getWinnerOfRound() {
    // console.log("Board: getWinnerOfROund")
    // console.log("Board: this.game.findWinnerOfRound(this.players) = " + this.game.findWinnerOfRound(this.players).id)
    return this.game.findWinnerOfRound(this.players);
  }

  /**
   * Gets the winner of a War tie scenario
   * @returns the player that won the round
   */
  getWinnerOfWar(tiedPlayers) {
    // console.log("Board: getWinnerOfROund")
    // console.log("Board: this.game.findWinnerOfRound(this.players) = " + this.game.findWinnerOfRound(this.players).id)
    return this.game.findWinnerOfWar(tiedPlayers, this.players);
  }

  /**
   * Gets a specific player from the players field
   * @param {*} uid - The player being searched for
   * @returns - A player from the players field
   */
  getPlayer(uid) {
    return this.players.find((player) => player.id === uid);
  }

  /**
   * Returns the game type that is currently being played
   * @returns the type of game that is being played
   */
  getGameType() {
    return this.game.gameType;
  }

  /**
   * A debug function to test and debug the tie scenario of War
   */
  debugWarTie() {
    this.game.debugWarTie(this.players);
  }

  /**
   * Finds all the players that are tied, and returns them
   * @returns a list of players that are tied
   */
  getTiedPlayers() {
    return this.game.getTiedPlayers(this.players);
  }

  /**
   * Finds if the players are still tied after a round of war
   * @param {*} tiedPlayers the players that used to be tied
   * @returns if the players are still tied
   */
  ifStillTied(tiedPlayers) {
    return this.game.ifStillTied(tiedPlayers);
  }

  /**
   * Declares war amongst the given players
   * @param {*} tiedPlayers declares war among the tied players
   */
  declareWar(tiedPlayers) {
    this.game.declareWar(tiedPlayers);
  }
}

module.exports = Board;
