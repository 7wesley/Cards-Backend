/**
 *Creates and manages a game of War
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

const Card = require("./Card");

class War {
  constructor(deck) {
    this.gameType = "War";
    this.deck = deck;
    this.playerIndex = 0;
    this.dealTurns = 2;
    this.turnIndex = 0;
    this.cardsToWin = [];
  }

  /**
   * The initial dealing of the cards. Deals one card at a time.
   * @param {*} players - The players that are part of the game
   * @returns - The player that was dealt to and the card that was
   * drawn from the deck
   */
  initialDeal(players) {
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
   * Only use this for Debugging War!
   *
   * Sets the last card of 2 players to be equal so a tie scenario can be tested
   * @param {*} players the players that are playing the game
   */
  debugWarTie(players) {
    players[0].setCards(new Card("C", "K"));
    players[1].setCards(new Card("D", "K"));
    players[2].setCards(new Card("H", "Q"));
  }

  /**
   * Sets what game the players are playing
   * @param {*} players the players to change their gameType
   */
  setGameTypes(players) {
    for (let i = 0; i < players.length; i++) {
      players[i].setGameType(this.gameType);
    }
  }

  /**
   * Finds the player that has to go next
   * @param {*} players The players currently in the game
   * @returns the player whose turn it is
   */
  findNextTurn(players) {
    // console.log("War: findNextTurn: begin")
    for (let i = 0; i < players.length; i++) {
      // console.log("player "+players[i].id+"'s ifMadeMove = "+players[i].getIfMadeMove())
      // console.log("player "+players[i].id+"'s status = "+players[i].status)
      // console.log("player "+players[i].id+"'s getLastCardFlipped() = "+players[i].getLastCardFlipped())

      // if(players[i].getLastCardFlipped() == null) {
      //   console.log("player "+players[i].id+"'s last card flipped = null")
      // }

      // else {
      //   console.log(
      //     "Player[i].getLastCard() = " +
      //       players[i].getLastCardFlipped().rank +
      //       " of " +
      //       players[i].getLastCardFlipped().suit
      //   );
      // }

      //If the player has not already made a move, then its their turn
      if (players[i].getLastCardFlipped() == null) {
        // console.log("War: nextTurn(): it is player "+players[i].id+" 's turn")
        return players[i];
      }
    }
    return null;
  }

  /**
   * Determines who's turn it currently is and uses that
   * information to get the next player's turn and return it.
   * @param {*} players - The players currently in the game
   * @returns - The numeric representation of who's turn it is
   */
  nextTurn(players) {
    //finds the current player's turn
    let currPlayer = this.findNextTurn(players);
    if (currPlayer != null) {
      // console.log("War: nextTurn(): it is player "+currPlayer.id+" 's turn")
      this.turn = currPlayer;
    }

    //All players have moved, so it is the first player's turn
    else {
      if (this.ifAllPlayersMoved(players)) {
        console.log("All players have moved");
      }
      // console.log("War: nextTurn(): it is player "+players[0].id+" 's turn")
      this.turn = players[0];
    }

    // if (players && this.turnIndex < players.length) {
    //   this.turn = players[this.turnIndex];
    //   this.turnIndex++;
    //   if (this.turnIndex == players.length) {
    //     this.turnIndex = 0;
    //   }
    // } else if (players) {
    //   this.turn = players[0];
    //   this.turnIndex = 0;
    // }

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
    let winnerOfRound = null;

    //Gets the winner of the round of War
    winnerOfRound = this.findHighestCardPlayer(players);

    //Finds if there is a tie among players
    var ifTie = this.findIfTie(players, winnerOfRound);

    //Runs this portion if more than two players tied
    if (ifTie) {
      let tiedPlayers = this.getTiedPlayers(players);

      //Sets the status of the players that are tied together
      for (let i = 0; i < tiedPlayers.length; i++) {
        tiedPlayers[i].setStatus("Tied");
      }
    } else {
      //Adds the winner's cards to their deck
      this.addCardsToWinningPlayer(winnerOfRound);

      //If any player is out of cards, replace them with backup if they have any
      this.ifOutOfCards(players);

      //Resets the status of all players
      this.resetPlayerHasMoved(players);
    }

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
    this.cardsToWin.push(this.turn.flipCard());
    // console.log(
    //   "War: flipCard: adding card to cardsToWin: " +
    //     this.turn.getLastCardFlipped().rank +
    //     " of " +
    //     this.turn.getLastCardFlipped().suit
    // );
    // console.log("War: last card flipped: " + card.actualValue);
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
      // console.log("War: makeMove 6 msg");
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
          highestCardPlayer = players[i];
        }
      }
    }

    return highestCardPlayer;
  }

  /**
   * Finds the players that tied with the highest card for the round
   * @param {*} players the players of this game of War
   * @returns a list of players that had the highest card and tied for the round
   */
  getTiedPlayers(players) {
    let tiedPlayers = [];
    let currValue =
      this.findHighestCardPlayer(players).getLastCardFlipped().actualValue;

    for (let i = 0; i < players.length; i++) {
      if (players[i].getLastCardFlipped().actualValue === currValue) {
        tiedPlayers.push(players[i]);

        // console.log("adding "+players[i].id+" with last card flipped = "+
        //   players[i].getLastCardFlipped().rank +"of" + players[i].getLastCardFlipped().suit)
      }
    }
    return tiedPlayers;
  }

  /**
   * Finds the winner of an I De Clare War scenario
   * @param {*} tiedPlayers the players that used to be tied
   * @returns the winner of the previously tied players
   */
  ifStillTied(tiedPlayers) {
    let currValue = tiedPlayers[0].getLastCardFlipped().actualValue;
    let currTiedPlayers = [];

    // console.log("War: ifStillTied: currValue = "+currValue);

    for (let i = 0; i < tiedPlayers.length; i++) {
      if (tiedPlayers[i].getLastCardFlipped().actualValue > currValue) {
        currValue = tiedPlayers[i].getLastCardFlipped().actualValue;
        // console.log("War: isStillTied: changed currValue to = "+currValue);
      }
    }

    for (let i = 0; i < tiedPlayers.length; i++) {
      if (tiedPlayers[i].getLastCardFlipped().actualValue == currValue) {
        currTiedPlayers.push(tiedPlayers[i]);
        // console.log("War: isStillTied: added player "+tiedPlayers[i].id)

        // console.log("adding "+players[i].id+" with last card flipped = "+
        //   players[i].getLastCardFlipped().rank +"of" + players[i].getLastCardFlipped().suit)
      }
    }
    return currTiedPlayers.length == tiedPlayers.length;
  }

  /**
   * Finds all the players that tied for the round
   * @param {*} players The players to find if there is a tie
   * @param {*} highestCardPlayer the player with the highest card of the round
   * @returns all the players that tied
   */
  findIfTie(players, highestCardPlayer) {
    let tiedPlayers = [];
    for (let i = 0; i < players.length; i++) {
      //Compare the highestCardPlayer's Card with all of the other player's cards
      if (
        highestCardPlayer.getLastCardFlipped().actualValue ===
        players[i].getLastCardFlipped().actualValue
      ) {
        tiedPlayers.push(players[i]);
      }
    }

    return tiedPlayers.length > 1;
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
  addCardsToWinningPlayer(highestCardPlayer) {
    // for (let i = 0; i < players.length; i++) {
    //   // console.log("War: adding "+players[i].getLastCardFlipped().rank+" to the winner")
    //   highestCardPlayer.setBackupCards(players[i].getLastCardFlipped());
    // }

    while (this.cardsToWin.length > 0) {
      // console.log("War: adding "+players[i].getLastCardFlipped().rank+" to the winner")
      highestCardPlayer.setBackupCards(this.cardsToWin.pop());
    }
    // console.log("War: reset this.cardsToWin\n");
  }

  /**
   * Returns the number of turns needed for the initial
   * deal.
   * @param {*} playerSize - The number of players part of the game
   * @returns - The number of turns needed for the initial deal.
   */
  getTurns(/*playerSize*/) {
    //Set the default to 2 for debugging purposes
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

  /**
   * Gets the next card from the top of the deck and
   * deals it to the user who's turn it currently is.
   */
  flipWarCard() {
    // console.log("War: flipWarCard");
    this.cardsToWin.push(this.turn.flipCard());
  }

  /**
   * Has each of the players that are in a tie flip over a card if they have another one
   * @param {*} players the players of this War game
   */
  declareWar(tiedPlayers) {
    // console.log("War: declareWar: 1 msg: looping 3 times: ");
    for (let i = 0; i < tiedPlayers.length; i++) {
      //If the the player has no cards in hand, and has backup cards, then shuffle
      if (
        tiedPlayers[i].cards.length === 0 &&
        tiedPlayers[i].getTotalCards() > 0
      ) {
        tiedPlayers[i].combineAndShuffleAllCards();
      }

      //Flip over a card if the player has any to flip over
      if (tiedPlayers[i].cards.length !== 0) {
        // console.log("War: declareWar: 2 flipping card");
        this.cardsToWin.push(tiedPlayers[i].flipCard());
        // console.log("War: declareWar: 3 just flipped card");
      }
    }
    // console.log("War: declareWar: 4 msg: end of 3rd loop");
  }

  /**
   * Finds the winner of a tie scenario of War
   * @param {*} tiedPlayers the players that are tied to be evaluated
   */
  findWinnerOfWar(tiedPlayers, players) {
    let winner = tiedPlayers[0];
    for (let i = 1; i < tiedPlayers.length; i++) {
      if (
        tiedPlayers[i].getLastCardFlipped().actualValue >
        winner.getLastCardFlipped().actualValue
      ) {
        winner = tiedPlayers[i];
      }
    }

    //Adds the winner's cards to their deck
    this.addCardsToWinningPlayer(winner);

    //If any player is out of cards, replace them with backup if they have any
    this.ifOutOfCards(players);

    // //Resets the status of all players
    // this.resetPlayerHasMoved(players);

    return winner;
  }
}

module.exports = War;
