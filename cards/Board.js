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

module.exports = class Board {
  constructor(game, players) {
    this.deck = new Deck();
    this.game = game;
    this.players = [];
    for (const [index, [, value]] of Object.entries(Object.entries(players))) {
      this.players[index] = new Player(players[value]);
    }
    this.startGame();
  }

  /**
   * Begins the game by creating an instance matching the local
   * game field.
   */
  startGame() {
    if (this.game === "Blackjack") {
      this.game = new Blackjack(this.deck);
    } else if (this.game === "War") {
      this.game = new War(this.deck);
    }
  }

  /**
   * Makes a move in the game field.
   * @param {*} choice - The move to be made
   */
  makeMove(choice) {
    this.game.makeMove(choice);
  }

  /**
   * Deals the card in the game field.
   * @returns - The initial cards dealt from the game field
   */
  initialDeal() {
    return this.game.initialDeal(this.players);
  }

  /**
   * Sets the gameTypes for all the players
   */
  setGameTypes() {
    this.game.setGameTypes(this.players);
  }

  /**
   * Determines if it's the turn of the user passed in
   * @param {*} uid - The user who's turn will be checked
   * @returns true if it's the passed in user's turn, otherwise false
   */
  isTurn(uid) {
    return this.game.getTurn().getId() === uid;
  }

  /**
   * Goes to the next turn in the game field and returns the player
   * who's turn it is
   * @returns - The player who's turn it is
   */
  nextTurn() {
    return this.game.nextTurn(this.players);
  }

  /**
   * Removes a player from the player field
   * @param {*} uid - The player to be removed
   */
  removePlayer(uid) {
    this.players = this.players.filter((player) => player.id !== uid);
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
   * Finds the number of turns in the game field
   * @returns - The number of turns for the specific game
   */
  getTurns() {
    return this.game.getTurns(this.players.length);
  }

  /**
   * Finds the winners in the game field
   * @returns - The winner(s) of the game
   */
  getWinners() {
    return this.game.findWinners(this.players);
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
};
