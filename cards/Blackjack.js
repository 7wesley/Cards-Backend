/**
 * Creates and manages a game of Blackjack
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 12/12/2021
 */

const { cloneDeep } = require("lodash");
const Card = require("./Card");
const Dealer = require("./Dealer");
const Game = require("./Game");

class Blackjack extends Game {
  /**
   * Represents the logic for a game of blackjack
   * @constructor
   */
  constructor(io, room, players, bank) {
    super(io, room, players, bank);
    this.dealer = new Dealer();
    this.turnIndex = 0;
    this.turn = null;
  }

  /**
   * The initial dealing of the cards
   */
  initialDeal() {
    for (let i = 0; i < 2; i++) {
      for (const player of this.players) {
        player.addCards(this.deck.deal());
      }
      this.dealer.addCards(this.deck.deal());
    }
    this.turn = this.players[0];
  }

  /**
   * Determines whose turn is next by looking at a player's
   * status
   * @returns - The player whose turn it is
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
   * deals it to the user whose turn it currently is.
   */
  dealCard() {
    const card = this.deck.deal();
    this.turn.addCards(card);

    let total = this.getTotal(this.turn);
    if (total > 21) {
      this.turn.setStatus("busted");
    }
  }

  /**
   * Gets the actual value of a players hand
   * @param {*} player - The player having their hand total checked
   * @returns - The player's actual hand value
   */
  getTotal(player) {
    let total = 0;
    const numAces = player
      .getCards()
      .filter((card) => card.getRank() === "A").length;

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

  /**
   * Logic for determining whether a dealer draws or stands
   * with their current hand. If total < 17, draw, else stand.
   */
  async dealerTurn() {
    if (this.dealer.getCards().length == 2) {
      await super.emitPlayers(this.displayPlayers(), 700);
    }
    if (this.getTotal(this.dealer) < 17) {
      this.makeMove("draw");
    } else {
      this.makeMove("stand");
    }
    await super.emitPlayers(this.displayPlayers(), 700);
  }

  /**
   * The default move made if a player does not make a choice
   */
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
   * Searches for users who haven't busted and have a card total higher
   * than the dealer and updates their bank
   * @returns - The players or dealer who won
   */
  getResults() {
    const prompt = "👑 Winners 👑";
    const players = this.players.filter(
      (player) => player.getStatus() !== "busted"
    );
    if (this.dealer.getStatus() === "busted" && players.length) {
      return { prompt, winners: players };
    }

    const dealerTotal = this.getTotal(this.dealer);
    const winners = players.filter((player) => {
      if (this.getTotal(player) > dealerTotal) {
        player.updateBank(player.getBet() * 2);
        return true;
      }
      return false;
    });

    return { prompt, winners: winners.length ? winners : [this.dealer] };
  }

  /**
   * Determines if the game still in progress
   * @returns - true if there are players remaining with
   * a "playing" status
   */
  inProgress() {
    return super.inProgress() || this.dealer.getStatus() === "playing";
  }

  /**
   * Resets the game so it can be played from the start again
   */
  resetGame() {
    super.resetGame();
    this.dealer = new Dealer("Blackjack");
    this.turn = null;
    this.turnIndex = 0;
  }

  /**
   * Formats the players for being displayed to the client side.
   * Hides the dealer's cards if necessary
   * @returns - The formatted players
   */
  displayPlayers() {
    let dealer = cloneDeep(this.dealer);
    let players = cloneDeep(this.players);
    if (dealer.getCards().length == 2 && this.turn != this.dealer) {
      dealer.setCard(1, new Card("H", "H"));
    }
    players.push(dealer);
    return players;
  }
}

module.exports = Blackjack;
