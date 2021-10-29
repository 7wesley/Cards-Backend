/**
 * Represents a player that can be part of a Board.
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */
module.exports = class Player {
  constructor(id) {
    this.id = id;
    this.cards = [];
    this.backupCards = [];
    this.total = 0;
    this.status = "playing";
    this.lastCardFlipped = null;
    this.ifMadeMove = false;
  }

  /**
   * Sets the cards field to the card passed in.
   * @param {*} card - The card to be set
   */
  setCards(card) {
    this.cards.push(card);
    this.total += card.value;
  }

  /**
   * Adds cards to the player's backup/win pile
   * @param {*} card the card to add to the backup
   */
  setBackupCards(card) {
    this.backupCards.push(card);
  }

  /**
   * Combines the deck in hand with the win/backup pile and shuffles
   */
  combineAndShuffleAllCards() {
    while (this.backupCards.length > 0) {
      this.setCards(this.backupCards.pop());
    }
    this.cards = this.cards.sort(() => Math.random() - 0.5);
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

  /**
   * Returns the total field.
   * @returns - amount of cards the player has
   */
  getTotal() {
    return this.total;
  }

  /**
   * Returns the cards field.
   * @returns - The cards field
   */
  get allCards() {
    return this.cards;
  }

  /**
   * Takes off the card from the top of the user's deck
   * @returns the card that was on top of the user's deck
   */
  flipCard() {
    let cardFlipped = this.cards.pop();
    if (cardFlipped != null) {
      this.total -= cardFlipped.value;
    }
    this.lastCardFlipped = cardFlipped;
    return cardFlipped;
  }

  /**
   * Finds the card the player flipped over for a round
   * @returns the card that the player most recently flipped
   */
  getLastCardFlipped() {
    return this.lastCardFlipped;
  }

  /**
   * Returns if the player made a move yet or not
   * @returns true if the player made a move, false otherwise
   */
  getIfMadeMove() {
    return this.ifMadeMove;
  }

  /**
   * Changes the status of if the player made a move
   * @param {any} ifMadeMove if the player made a move
   */
  setIfMadeMove(ifMadeMove) {
    this.ifMadeMove = ifMadeMove;
  }

  /**
   * Finds if this player has any cards left
   * @returns true if the player has cards left, false otherwise
   */
  hasCardsLeft() {
    if (this.cards.length == 0 && this.backupCards.length == 0) {
      return false;
    }
    return true;
  }
};
