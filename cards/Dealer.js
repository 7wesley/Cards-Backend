/**
 * Represents a dealer that can be part of a Game.
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 12/12/2021
 */

const Player = require("./Player");

class Dealer extends Player {
  /**
   * Represents a dealer
   * @constructor
   */
  constructor() {
    const image = "/Images/dealer.png";
    super("Dealer", image);
  }
}

module.exports = Dealer;
