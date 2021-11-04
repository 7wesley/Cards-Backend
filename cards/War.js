/**
 *Creates and manages a game of War
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

module.exports = class War {
  constructor(deck) {
    this.gameType = "War";
    this.deck = deck;
    this.playerIndex = 0;
    this.dealTurns = 2;
    this.turnIndex = 0;
  }

  /**
   * The initial dealing of the cards. Deals one card at a time.
   * @param {*} players - The players that are part of the game
   * @returns - The player that was dealt to and the card that was
   * drawn from the deck
   */
  initialDeal(players) {
    // console.log("War: initialDeal")
    var card = this.deck.deal();
    var player = players[this.playerIndex];
    player.setCards(card);
    this.playerIndex++;
    if (this.playerIndex == players.length) {
      this.playerIndex = 0;
    }
    return { id: player.id, card };
  }

  /**
   * Sets what game the players are playing
   * @param {*} players the players to change their gameType
   */
  setGameTypes(players) {
    for(let i = 0; i < players.length; i++) {
      players[i].setGameType(this.gameType)
    }
  }

  /**
   * Determines who's turn it currently is and uses that
   * information to get the next player's turn and return it.
   * @param {*} players - The players currently in the game
   * @returns - The numeric representation of who's turn it is
   */
  nextTurn(players) {
    if (players && this.turnIndex < players.length) {
      this.turn = players[this.turnIndex];
      this.turnIndex++;
      if (this.turnIndex == players.length) {
        this.turnIndex = 0;
      }
    } else if (players) {
      this.turn = players[0];
      this.turnIndex = 0;
    }

    //Set this player's turn as finished
    this.turn.setIfMadeMove(true);
    this.turn.setStatus("playing");

    return this.turn;
  }

  /**
   * Finds the winner of a round of War
   * @param {any} players the players for this game
   * @returns the winner of the round
   */
  findWinnerOfRound(players) {
    // console.log("War: findWinnerOfRound")
    let winnerOfRound = null;
    winnerOfRound = this.findHighestCardPlayer(players);
    // console.log("War: winnerOfRound = "+winnerOfRound.id)

    this.resetPlayerHasMoved(players);
    // console.log("War: Reset all player moves")
    // console.log("War: returning whom is the winner of the round:  " + winnerOfRound.id)

    return winnerOfRound;
  }

  /**
   * Finds if all the players of this game have made a move
   * @param {any} players the list of players in the game
   * @returns true if all plays have moved this turn, false otherwise
   */
  ifAllPlayersMoved(players) {
    // console.log("War: ifAllPlayersMoved()")
    let allPlayersMadeMove = true;
    for (let i = 0; i < players.length; i++) {
      // console.log("War: players[i].id: "+players[i].id)
      // console.log("War: players[i].getIfMadeMove(): "+players[i].getIfMadeMove())

      if (players[i].getIfMadeMove() == false) {
        allPlayersMadeMove = false;
      }
    }
    return allPlayersMadeMove;
  }

  /**
   * Resets all the player's turns
   * @param {any} players the players of this game
   */
  resetPlayerHasMoved(players) {
    for (let i = 0; i < players.length; i++) {
      players[i].setIfMadeMove(false);
    }
  }

  /**
   * Gets the next card from the top of the deck and
   * deals it to the user who's turn it currently is.
   */
  flipCard() {
    const card = this.turn.flipCard();
    console.log("War: last card flipped: " + card.actualValue);
    this.turn.setStatus("madeMove");
  }

  /**
   * The user flips one of their cards, otherwise,
   * nothing happens
   * @param {*} choice - The choice a user makes on
   * their move.
   */
  makeMove(choice) {
    //If the user has no cards left, gameover for them
    if (!this.turn.hasCardsLeft()) {
      console.log("No Cards left for " + this.turn.id);
      this.turn.setStatus("noCards");
    }

    //If the user decides to flip a card
    else if (choice === "draw") {
      // console.log("Its : "+this.turn.id+"'s turn")
      this.flipCard();
    }

    //This could be for if the player wants to "automate" their turn
    else this.flipCard();
  }

  /**
   * Returns the turn field
   * @returns - The turn field
   */
  getTurn() {
    return this.turn;
  }

  /**
   * Finds the highest card of the players of a round
   * @param {any} players the list of players to find the highest card of
   */
  findHighestCardPlayer(players) {
    let highestCardPlayer = null;
    for (let i = 0; i < players.length; i++) {
      if (highestCardPlayer == null) {
        highestCardPlayer = players[i];
      } else {
        // console.log("Comparing highestCardPlayer.getLastCardFlipped().value = " + highestCardPlayer.getLastCardFlipped().actualValue)
        // console.log("With players[i].getLastCardFlipped().value = " + players[i].getLastCardFlipped().actualValue)
        //Finds if the next player has the highest card
        if (
          highestCardPlayer.getLastCardFlipped().actualValue <
          players[i].getLastCardFlipped().actualValue
        ) {
          // console.log("Set the highest card to the other player's = " + players[i].getLastCardFlipped().actualValue)
          highestCardPlayer = players[i];
        }
      }
    }
    // console.log("The highest card is: "+highestCardPlayer.id+" with card value of "+highestCardPlayer.getLastCardFlipped().actualValue)

    this.addCardsToWinningPlayer(players, highestCardPlayer);

    //If any player is out of cards, replace them with backup if they have any
    this.ifOutOfCards(players);

    return highestCardPlayer;
  }

  /**
   * Reshuffles all of a player's cards if they are out of cards in their hand
   * @param {*} players the players to check if they are out of cards
   */
  ifOutOfCards(players) {
    for (let i = 0; i < players.length; i++) {
      if (players[i].cards.length == 0) {
        players[i].combineAndShuffleAllCards();
      }
    }
  }

  /**
   * Adds the round's cards to the deck of the player that won the round
   * @param {*} players the players of this War game
   * @param {*} highestCardPlayer the player that won the round
   */
  addCardsToWinningPlayer(players, highestCardPlayer) {
    for (let i = 0; i < players.length; i++) {
      // console.log("War: adding "+players[i].getLastCardFlipped().rank+" to the winner")
      highestCardPlayer.setBackupCards(players[i].getLastCardFlipped());
    }
  }

  /**
   * Returns the number of turns needed for the initial
   * deal.
   * @param {*} playerSize - The number of players part of the game
   * @returns - The number of turns needed for the initial deal.
   */
  getTurns(/*playerSize*/) {
    //Set the default to 4 for debugging purposes
    return 6;
  }

  /**
   * Searches for users who haven't busted and have the highest card total
   * of all users. In the event of a tie, multiple users can be returned
   * @param {*} players - The players currently part of the game
   * @returns - The players who won
   */
  findWinners(players) {
    let highest = Math.max(...players.map((player) => player.getTotal()), 0);
    return players.filter((player) => player.getTotal() === highest);
  }
};
