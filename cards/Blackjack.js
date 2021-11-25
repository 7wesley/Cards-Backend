/**
 * Creates and manages a game of Blackjack
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

const Dealer = require("./Dealer");
const Game = require("./Game");
const Ranks = require("./Ranks");

class Blackjack extends Game {
  constructor(players) {
    super(players);
    this.dealer = new Dealer("Blackjack");
    this.turnIndex = 0;
    this.turn = this.players[0];
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
    if (!this.turn || this.turn.getStatus() !== "playing") {
      this.turnIndex++;
    }
    if (this.turnIndex >= this.players.length) {
      this.turn = this.dealer;
    } else {
      this.turn = this.players[this.turnIndex];
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

    let total = this.getTotal(this.turn);
    if (total == 21) {
      this.turn.setStatus("blackjack");
    } else if (total > 21) {
      this.turn.setStatus("busted");
    }
  }

  getTotal(player) {
    let total = 0;
    let numAces = player
      .getCards()
      .filter((card) => card.getValue() === Ranks.A).length;

    for (const card of player.getCards()) {
      total += card.getValue();
    }
    for (let i = 0; i < numAces; i++) {
      if (total > 21) {
        total -= 10;
      }
    }
    return total;
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

  dealerTurn() {
    if (this.getTotal(this.dealer) < 17) {
      this.makeMove("draw");
    } else {
      this.makeMove("stand");
    }
  }

  defaultMove() {
    this.makeMove("stand");
  }

  /**
   * Returns the turn field
   * @returns - The turn field
   */
  getTurn() {
    return this.turn;
  }

  /**
   * Searches for users who haven't busted and have the highest card total
   * of all users. In the event of a tie, multiple users can be returned
   * @param {*} this.players - The this.players currently part of the game
   * @returns - The this.players who won
   */
  getWinners() {
    let players = this.players.filter(
      (player) => player.getStatus() !== "busted"
    );
    if (this.dealer.getStatus() === "busted" && players.length) {
      return { prompt: "Dealer busted!", players: players };
    }

    const dealerTotal = this.getTotal(this.dealer);
    players = players.filter((player) => this.getTotal(player) > dealerTotal);
    if (!players.length) {
      return { players: [this.dealer] };
    }
    return { players: players };
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
