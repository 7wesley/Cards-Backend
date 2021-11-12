const Card = require("./Card");

class Dealer {
  constructor(gameType) {
    this.cards = [];
    this.total = 0;
    this.gameType = gameType;
  }

  addCard(card) {
    this.cards.push(card);
    this.total += card.value;
  }

  toString() {
    let visibleCards = this.cards;
    if (this.gameType == "Blackjack") {
      visibleCards = visibleCards.slice(0, -1);
      visibleCards.push(new Card(null, null));
    }
    return {
      dealer: true,
      cards: visibleCards,
    };
  }
}

module.exports = Dealer;
