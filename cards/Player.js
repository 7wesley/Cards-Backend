/**
 * Represents a player that can be part of a Board.
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */
class Player {
  constructor(id) {
    this.id = id;
    this.cards = [];
    this.status = "playing";
    this.bet = 0;
    this.bank = 0;
    this.deck = [];
  }

  getCards() {
    return this.cards;
  }

  resetCards() {
    this.cards = [];
  }
  /**
   * Sets the cards field to the card passed in.
   * @param {*} card - The card to be set
   */
  addCards(...cards) {
    this.cards.push(...cards);
  }

  setBet(bet) {
    this.bet = bet;
    this.bank -= bet;
  }

  getBet() {
    return this.bet;
  }

  updateBank(amount) {
    this.bank += amount;
  }

  getBank() {
    return this.bank;
  }

  resetFields() {
    this.bet = 0;
    this.cards = [];
    this.status = "playing";
  }

  /**
   * Adds cards to the player's backup/win pile
   * @param {*} card the card to add to the backup
   */
  addToDeck(...cards) {
    this.deck.push(...cards);
  }

  getDeck() {
    return this.deck;
  }

  /**
   * Sets the status field to the status passed in.
   * @param {*} status - The status to be set
   */
  setStatus(status) {
    this.status = status;
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
}

module.exports = Player;
