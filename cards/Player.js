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
    //this.backupCards = [];
    //this.lastCardFlipped = null;
    //this.ifMadeMove = false;
    //this.gameType = null;
  }

  getCards() {
    return this.cards;
  }

  /**
   * Sets the cards field to the card passed in.
   * @param {*} card - The card to be set
   */
  addCard(card) {
    this.cards.push(card);
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
  getTotalCards() {
    return this.cards.length + this.backupCards.length;
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
   * Resets the player's lastCardFlipped
   */
  resetLastCardFlipped() {
    this.lastCardFlipped = null;
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

  /**
   * Sets the game that the player is currently playing
   * @param {*} gameType the new gametype the player is playing
   */
  setGameType(gameType) {
    this.gameType = gameType;
  }

  toString() {
    return {
      id: this.id,
      cards: this.cards,
    };
  }
}

module.exports = Player;
