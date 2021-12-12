const Player = require("./Player");

class Dealer extends Player {
  constructor() {
    const image = "/Images/Dealer.png";
    super("Dealer", image);
  }
}

module.exports = Dealer;
