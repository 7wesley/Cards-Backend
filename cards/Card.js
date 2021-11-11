/**
 * For creating a card simulated in the card games
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

let Ranks = require("./Ranks");

/**
 * Represents a single card in a deck.
 */
class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.value = Ranks[rank];
    this.actualValue = this.getActualValue(this.rank);
    this.image = `/Images/Cards/${rank}${suit}.png`;
  }

  getActualValue(rank) {
    switch (rank) {
      case "J":
        return 11;
      case "Q":
        return 12;
      case "K":
        return 13;
    }
    return this.value;
  }
};

module.exports = Card;