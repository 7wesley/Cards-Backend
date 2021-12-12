/**
 * Creates and manages a game of War
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 12/12/2021
 */

const { cloneDeep } = require("lodash");
const Card = require("./Card");
const Game = require("./Game");

class War extends Game {
  /**
   * Represents the logic for a game of war
   * @constructor
   */
  constructor(io, room, players, bank) {
    super(io, room, players, bank);
    this.turnIndex = 0;
    this.turn = null;
    this.cardsToWin = [];
    this.roundEnded = false;
  }

  /**
   * The initial dealing of the cards
   */
  initialDeal() {
    for (let i = 0; i < Math.floor(52 / this.players.length); i++) {
      for (const player of this.players) {
        player.addToDeck(this.deck.deal());
      }
    }
  }

  /**
   * Increments the turnIndex and returns whose turn it is next
   * @returns - The player whose turn it is
   */
  nextTurn() {
    while (
      !this.players[this.turnIndex] ||
      this.players[this.turnIndex].getStatus() !== "playing"
    ) {
      this.turnIndex++;
      if (this.turnIndex >= this.players.length) {
        this.resetRound();
      }
    }

    this.turn = this.players[this.turnIndex];
    this.turnIndex++;
    if (this.turnIndex >= this.players.length) {
      this.resetRound();
    }

    return this.turn;
  }

  /**
   * Resets a round by setting the turnIndex back to 0
   */
  resetRound() {
    this.roundEnded = true;
    this.turnIndex = 0;
  }

  /**
   * Finds if all the players of this round have made a move
   * @returns true if all players have moved this round, false otherwise
   */
  allPlayersMoved() {
    if (this.roundEnded) {
      this.roundEnded = false;
      return true;
    }
    return false;
  }

  /**
   * The user flips one of their cards, otherwise,
   * nothing happens
   * @param {*} choice - The choice a user makes on
   * their move.
   */
  async makeMove(choice) {
    if (choice === "draw") {
      let topCard = this.turn.getDeck().shift();
      this.turn.getDeck();
      this.cardsToWin.push(topCard);
      this.turn.addCards(topCard);
    } else if (choice === "forfeit") {
      this.turn.setStatus("busted");
    }
    if (this.allPlayersMoved()) {
      super.resetCurrTurn();
      await super.emitPlayers(this.displayPlayers(), 500);
      await this.handleRound();
    }
  }

  /**
   * Handles a round ending by finding the winning players,
   * clearing the cards, and emitting the results
   */
  async handleRound() {
    let winners = this.findWinningPlayers();
    if (winners.length > 1) {
      winners = await this.handleWar(winners);
    }
    if (winners.length == 1) {
      winners[0].addToDeck(...this.cardsToWin);
      await super.emitResults(winners, "👑 Round winner 👑", 1500);
    }
    for (const player of this.players) {
      player.resetCards();
      if (player.getDeck().length === 0) {
        player.setStatus("busted");
      }
    }
    this.cardsToWin = [];
  }

  /**
   * Searches for users who haven't busted and have the highest card total
   * of all users. In the event of a tie, multiple users can be returned
   * @returns - The players who won
   */
  findWinningPlayers() {
    let players = this.players.filter((p) => p.getStatus() === "playing");
    let highest = Math.max(
      ...players.map((player) => this.getTotal(player)),
      0
    );
    return players.filter((player) => this.getTotal(player) === highest);
  }

  /**
   * Gets the actual value of a players hand
   * @param {*} player - The player having their hand total checked
   * @returns - The player's actual hand value
   */
  getTotal(player) {
    const topCard = player.getCards()[player.getCards().length - 1];
    switch (topCard.getRank()) {
      case "A":
        return 14;
      case "K":
        return 13;
      case "Q":
        return 12;
      case "J":
        return 11;
      default:
        return topCard.getValue();
    }
  }

  /**
   * Finds the winner of war between tied players and recursively calls
   * itself if there is more than 1 winner.
   * @param {*} tiedPlayers - The players who are at war
   */
  async handleWar(tiedPlayers) {
    let winningPlayers;

    for (const player of tiedPlayers) {
      if (player.getDeck().length < 4) {
        player.setStatus("busted");
        this.cardsToWin = this.cardsToWin.concat(player.getDeck());
      } else {
        const topCards = player.getDeck().splice(0, 4);
        this.cardsToWin = this.cardsToWin.concat(topCards);
        player.addCards(...topCards);
      }
      await super.emitPlayers(this.displayPlayers(), 750);
    }

    winningPlayers = this.findWinningPlayers(tiedPlayers);
    if (winningPlayers.length > 1) {
      winningPlayers = this.handleWar(winningPlayers);
    }
    return winningPlayers;
  }

  /**
   * The default move made if a player does not make a choice
   */
  defaultMove() {
    this.makeMove("draw");
  }

  /**
   * Formats the players for being displayed to the client side.
   * Hides the player's cards if necessary
   * @returns - The formatted players
   */
  displayPlayers() {
    let players = cloneDeep(this.players);
    for (const player of players) {
      if (player.getCards().length >= 5) {
        for (let i = 0; i < player.getCards().length; i++) {
          if (!(i % 4 == 0)) {
            player.setCard(i, new Card("H", "H"));
          }
        }
      }
    }
    return players;
  }

  /**
   * Determines if the game still in progress
   * @returns - true if there is more than 1 player with
   * a "playing" status
   */
  inProgress() {
    let activePlayers = this.players.filter(
      (player) => player.getStatus() == "playing"
    );
    return activePlayers.length > 1;
  }

  /**
   * Searches for a user who still has a "playing" status and
   * updates their bank
   * @returns - The players or dealer who won
   */
  getResults() {
    const prompt = "👑 Winners 👑";
    let winner = this.players.find((player) => player.getStatus() == "playing");
    winner.updateBank(winner.getBet() * 2);
    return { prompt, winners: [winner] };
  }

  /**
   * Resets the game so it can be played from the start again
   */
  resetGame() {
    super.resetGame();
    this.turn = null;
    this.turnIndex = 0;
  }
}

module.exports = War;
