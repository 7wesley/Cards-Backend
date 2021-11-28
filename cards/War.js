/**
 *Creates and manages a game of War
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

const Card = require("./Card");
const Game = require("./Game");
const ranks = require("./Ranks");
const Ranks = require("./Ranks");

class War extends Game {
  constructor(io, room, players, bank) {
    super(io, room, players, bank);
    this.turnIndex = 0;
    this.turn;
    this.cardsToWin = [];
  }

  /**
   * The initial dealing of the cards. Deals one card at a time.
   * @param {*} players - The players that are part of the game
   * @returns - The player that was dealt to and the card that was
   * drawn from the deck
   */
  initialDeal() {
    for (let i = 0; i < 26; i++) {
      for (const player of this.players) {
        player.addToDeck(this.deck.deal());
      }
    }
  }

  /**
   * Only use this for Debugging War!
   *
   * Sets the last card of 2 players to be equal so a tie scenario can be tested
   * @param {*} players the players that are playing the game
   */
  debugWarTie() {
    this.players[0].addCards(new Card("C", "K"));
    this.players[1].addCards(new Card("C", "K"));
  }

  nextTurn() {
    this.turn = this.players[this.turnIndex];
    this.turnIndex++;
    if (this.turnIndex >= this.players.length) {
      this.turnIndex = 0;
    }
    return this.turn;
  }

  /**
   * Finds if all the players of this game have made a move
   * @param {any} players the list of players in the game
   * @returns true if all plays have moved this turn, false otherwise
   */
  allPlayersMoved() {
    return this.turnIndex === 0;
  }

  /**
   * The user flips one of their cards, otherwise,
   * nothing happens
   * @param {*} choice - The choice a user makes on
   * their move.
   */
  async makeMove(choice) {
    if (choice === "draw") {
      let topCard = this.turn.getDeck().shift();
      this.turn.getDeck();
      this.cardsToWin.push(topCard);
      this.turn.addCards(topCard);
    } else if (choice === "forfeit") {
      super.removePlayer(this.turn.getId());
    }
    if (this.allPlayersMoved()) {
      await super.emitPlayersDelay();
      await this.handleRound();
    }
  }

  async handleRound() {
    let winners = this.findWinningPlayers();
    if (winners.length > 1) {
      winners = await this.handleWar(winners);
    }
    if (winners.length == 1) {
      winners[0].addToDeck(...this.cardsToWin);
    }
    for (const player of this.players) {
      player.resetCards();
      if (player.getDeck().length === 0) {
        player.setStatus("lost");
      }
    }
    this.cardsToWin = [];
  }

  /**
   * Searches for users who haven't busted and have the highest card total
   * of all users. In the event of a tie, multiple users can be returned
   * @param {*} players - The players currently part of the game
   * @returns - The players who won
   */
  findWinningPlayers() {
    let players = this.players.filter((p) => p.getStatus() === "playing");
    let highest = Math.max(
      ...players.map((player) => this.getTotal(player)),
      0
    );
    return players.filter((player) => this.getTotal(player) === highest);
  }

  getTotal(player) {
    const topCard = player.getCards()[player.getCards().length - 1];
    switch (topCard.getRank()) {
      case "A":
        return 14;
      case "K":
        return 13;
      case "Q":
        return 12;
      case "J":
        return 11;
      default:
        return topCard.getValue();
    }
  }

  /**
   * Has each of the players that are in a tie flip over a card if they have another one
   * @param {*} players the players of this War game
   */
  async handleWar(tiedPlayers) {
    let winningPlayers;

    for (const player of tiedPlayers) {
      if (player.getDeck().length < 4) {
        player.setStatus("lost");
      } else {
        const topCards = player.getDeck().splice(0, 4);
        this.cardsToWin = this.cardsToWin.concat(topCards);
        player.addCards(...topCards);
        await super.emitPlayersDelay();
      }
    }

    winningPlayers = this.findWinningPlayers(tiedPlayers);
    if (winningPlayers.length > 1) {
      winningPlayers = this.handleWar(winningPlayers);
    }
    return winningPlayers;
  }

  defaultMove() {
    this.makeMove("draw");
  }

  displayPlayers() {
    return this.players;
  }

  inProgress() {
    let activePlayers = this.players.filter((p) => p.getStatus() != "lost");
    return activePlayers.length > 1;
  }

  getResults() {
    let winners = this.players.filter(
      (player) => player.getStatus() == "playing"
    );
    return { winners: winners };
  }
}

module.exports = War;
