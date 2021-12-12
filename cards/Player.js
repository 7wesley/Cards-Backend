/**
 * Represents a player that can be part of a Board.
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */
class Player {
  constructor(id, image) {
    this.id = id;
    this.image = image;
    this.cards = [];
    this.deck = [];
    this.status = "playing";
    this.bet = 0;
    this.bank = 0;
  }

  getCards() {
    return this.cards;
  }

  getBet() {
    return this.bet;
  }

  getBank() {
    return this.bank;
  }

  getDeck() {
    return this.deck;
  }

  /**
   * Returns the status field.
   * @returns - The status field
   */
  getStatus() {
    return this.status;
  }

  /**
   * Returns the id field.
   * @returns - The id field
   */
  getId() {
    return this.id;
  }

  setBet(bet) {
    this.bet = bet;
    this.bank -= bet;
  }

  setCard(index, card) {
    this.cards[index] = card;
  }

  /**
   * Sets the status field to the status passed in.
   * @param {*} status - The status to be set
   */
  setStatus(status) {
    this.status = status;
  }

  /**
   * Sets the cards field to the card passed in.
   * @param {*} card - The card to be set
   */
  addCards(...cards) {
    this.cards.push(...cards);
  }

  /**
   * Adds cards to the player's backup/win pile
   * @param {*} card the card to add to the backup
   */
  addToDeck(...cards) {
    this.deck.push(...cards);
  }

  resetCards() {
    this.cards = [];
  }

  updateBank(amount) {
    this.bank += amount;
  }

  resetFields() {
    this.bet = 0;
    this.cards = [];
    this.deck = [];
    this.status = "playing";
  }
}

module.exports = Player;
