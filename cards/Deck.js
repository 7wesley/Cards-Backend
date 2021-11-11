/**
 * Manages a deck of cards
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

var Card = require("./Card");
const suits = require("./Suits");
const ranks = require("./Ranks");
/**
 * Represents a deck of cards
 */
class Deck {
  constructor() {
    this.cards = [];
    for (const suit of Object.keys(suits)) {
      for (const rank of Object.keys(ranks)) {
        this.cards.push(new Card(suit, rank));
      }
    }
    this.shuffle();
  }

  /**
   * Performs a Fisher-Yates shuffle of the cards in the cards field.
   */
  shuffle() {
    const cards = this.cards;
    let m = cards.length,
      i;
    while (m) {
      i = Math.floor(Math.random() * m--);

      [cards[m], cards[i]] = [cards[i], cards[m]];
    }
  }

  /**
   * Deals a single card from the cards field.
   * @returns - The top card of the deck
   */
  deal() {
    return this.cards.pop();
  }

  /**
   * Formats the cards in a user readable string.
   * @returns - A string representing all the cards in the deck
   */
  toString() {
    var total = ``;
    for (const card of this.cards) {
      total += " " + card.suit + card.rank;
    }
    return total;
  }
};

module.exports = Deck;
