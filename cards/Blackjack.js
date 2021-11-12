/**
 * Creates and manages a game of Blackjack
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

const Dealer = require("./Dealer");
const Game = require("./Game");

class Blackjack extends Game {
  constructor(players) {
    super(players);
    this.dealer = new Dealer("Blackjack");
    this.turnIndex = 0;
  }

  /**
   * The initial dealing of the cards. Deals one card at a time.
   * @returns - The player that was dealt to and the card that was
   * drawn from the deck
   */
  initialDeal() {
    for (let i = 0; i < 2; i++) {
      for (const player of this.players) {
        player.addCard(this.deck.deal());
      }
      this.dealer.addCard(this.deck.deal());
    }
  }

  /**
   * Determines who's turn it currently is and uses that
   * information to get the next player's turn and return it.
   * @param {*} this.players - The this.players currently in the game
   * @returns - The numeric representation of who's turn it is
   */
  nextTurn() {
    if (this.players && this.turnIndex < this.players.length) {
      if (this.turn && this.turn.getStatus() !== "playing") {
        this.incrementTurn();
      }
      this.turn = this.players[this.turnIndex];
    } else if (this.players) {
      this.turn = players[0];
      this.turnIndex = 0;
    }
    return this.turn;
  }

  /**
   * Gets the next card from the top of the deck and
   * deals it to the user who's turn it currently is.
   */
  dealCard() {
    const card = this.deck.deal();
    this.turn.addCard(card);
    if (this.turn.getTotal() > 21) {
      this.turn.setStatus("busted");
    }
  }

  /**
   * Deals a card if a user draws, otherwise sets
   * their status to standing.
   * @param {*} choice - The choice a user makes on
   * their move.
   */
  makeMove(choice) {
    if (choice === "draw") {
      this.dealCard();
    } else {
      this.turn.setStatus("standing");
    }
  }

  /**
   * Returns the turn field
   * @returns - The turn field
   */
  getTurn() {
    return this.turn;
  }

  /**
   * Returns the number of turns needed for the initial
   * deal.
   * @param {*} this.playersize - The number of this.players part of the game
   * @returns - The number of turns needed for the initial deal.
   */
  getTurns() {
    return this.players.length * 2;
  }

  incrementTurn() {
    this.turnIndex++;
    if (this.turnIndex == this.players.length) {
      this.turnIndex = 0;
    }
  }

  getPrompt() {
    return "Draw again for 21?";
  }

  /**
   * Searches for users who haven't busted and have the highest card total
   * of all users. In the event of a tie, multiple users can be returned
   * @param {*} this.players - The this.players currently part of the game
   * @returns - The this.players who won
   */
  findWinners() {
    let highest = Math.max(
      ...this.players.map((player) => player.getTotal()),
      0
    );
    return this.players.filter((player) => player.getTotal() === highest);
  }

  dealTime() {
    return 700;
  }

  displayPlayers() {
    let players = super.getPlayersFormatted();
    players.push(this.dealer.toString());
    return players;
  }
}

module.exports = Blackjack;
