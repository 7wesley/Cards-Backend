const Card = require("./Card");

class Dealer {
  constructor(gameType) {
    this.cards = [];
    this.gameType = gameType;
    this.status = "playing";
    this.id = "Dealer";
    this.hideCards = true;
  }

  getStatus() {
    return this.status;
  }

  getCards() {
    return this.cards;
  }

  setStatus(status) {
    this.status = status;
    this.hideCards = false;
  }

  addCard(card) {
    this.cards.push(card);
  }

  toString() {
    let visibleCards = this.cards;
    if (this.gameType == "Blackjack" && this.hideCards && this.cards.length) {
      visibleCards = visibleCards.slice(0, -1);
      visibleCards.push(new Card("H", "H"));
    }
    return {
      id: "Dealer",
      cards: visibleCards,
    };
  }
}

module.exports = Dealer;
