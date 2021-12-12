/**
 * Represents a player that can be part of a Game.
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */
class Player {
  /**
   * Represents a player
   * @constructor
   */
  constructor(id, image) {
    this.id = id;
    this.image = image;
    this.cards = [];
    this.deck = [];
    this.status = "playing";
    this.bet = 0;
    this.bank = 0;
  }

  /**
   * Gets a player's card
   * @returns - This player's cards
   */
  getCards() {
    return this.cards;
  }

  /**
   * Gets a player's bet
   * @returns - This player's bet
   */
  getBet() {
    return this.bet;
  }

  /**
   * Gets a player's bank
   * @returns - This player's bank
   */
  getBank() {
    return this.bank;
  }

  /**
   * Gets a player's deck
   * @returns - This player's deck
   */
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

  /**
   * Sets a palyer's bet
   * @param {*} bet - The bet to be set
   */
  setBet(bet) {
    this.bet = bet;
    this.bank -= bet;
  }

  /**
   * Sets a player's card at a specific index
   * @param {*} index - The index of the card to be replaced
   * @param {*} card - The card to be replaced with
   */
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

  /**
   * Resets a player's cards to an empty array
   */
  resetCards() {
    this.cards = [];
  }

  /**
   * Increments the bank by the amount specified
   * @param {*} amount - The amount to increment the bank by
   */
  updateBank(amount) {
    this.bank += amount;
  }

  /**
   * Resets all of the player's fields to their starting values
   */
  resetFields() {
    this.bet = 0;
    this.cards = [];
    this.deck = [];
    this.status = "playing";
  }
}

module.exports = Player;
