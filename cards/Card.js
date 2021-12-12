/**
 * For creating a card simulated in the card games
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 12/12/2021
 */

let ranks = require("./Ranks");

class Card {
  /**
   * Represents a single card in a deck
   * @constructor
   */
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.value = ranks[rank];
  }

  /**
   * Gets the equivalent value of a rank
   * @returns - The card's value
   */
  getValue() {
    return this.value;
  }

  /**
   * Gets the rank of the card
   * @returns - The card's rank
   */
  getRank() {
    return this.rank;
  }
}

module.exports = Card;
