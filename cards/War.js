/**
 *Creates and manages a game of War
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */

module.exports = class War {
    constructor(deck) {
        this.gameType = "War"
        this.deck = deck;
        this.playerIndex = 0;
        this.dealTurns = 2;
        this.turnIndex = 0;
        this.LastCardFlipped = ""
    }
  
    /**
     * The initial dealing of the cards. Deals one card at a time.
     * @param {*} players - The player that are part of the game
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
        
        // console.log("War: nextturn()")
        // let playerList = this.players.find((player) => player.id === uid);
        // playing = this.players.filter(
        //     (player) => player.getIfMadeMove() === true
        // );
        // console.log("War: playing.length = "+playing.length)
        // console.log("War: playerList = "+playerList)

        // allPlayersMadeMove = playing.length == 2;
        // console.log("War: allPlayersMadeMove = "+allPlayersMadeMove)
        
        // console.log("War: before ifAllPlayersMoved()")

        if(this.ifAllPlayersMoved(players)) {
            console.log("War: found all players made a move")
            console.log("War: players = "+players)
            // console.log("War: "+this.findWinnerOfRound(players))
            this.findWinnerOfRound(players)
        }
        
        //TODO right spot???
        this.turn.setIfMadeMove(true)
        
        return this.turn;
    }


    /**
     * Finds the winner of a round of War
     * @param {any} players the players for this game
     */
     findWinnerOfRound(players) {
        console.log("War: findWinnerOfRound")
        let winnerOfRound = null;
        console.log("War: WinnerOfRound = "+winnerOfRound)
        console.log("War: findHighestCardPlayer(players) = "+this.findHighestCardPlayer(players))
        winnerOfRound = this.findHighestCardPlayer(players)
        console.log("War: winnerOfRound = "+winnerOfRound.id)
        this.resetPlayerHasMoved(players)
        console.log("War: Reset all player moves")
        
        
        //TODO break from while loop in server.js
        
    }

    /**
     * Finds if all the players of this game have made a move
     * @param {any} players the list of players in the game
     * @returns true if all plays have moved this turn, false otherwise
     */
    ifAllPlayersMoved(players) {
        console.log("War: ifAllPlayersMoved()")
        let allPlayersMadeMove = true;
        for(let i = 0; i < players.length; i++) {

            // console.log("War: players[i].id: "+players[i].id)
            // console.log("War: players[i].getIfMadeMove(): "+players[i].getIfMadeMove())

            if(players[i].getIfMadeMove() == false) {
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
        for(let i = 0; i < players.length; i++) {
            players[i].setIfMadeMove(false)
            players[i].setStatus("playing")
        }
    }
  
    /**
     * Gets the next card from the top of the deck and
     * deals it to the user who's turn it currently is.
     */
    flipCard() {
        const card = this.turn.flipCard()
        // this.turn.setStatus("standing")
        this.turn.setStatus("madeMove")
    }
  
    /**
     * The user flips one of their cards, otherwise,
     * nothing happens
     * @param {*} choice - The choice a user makes on
     * their move.
     */
    makeMove(choice) {

        //If the user decides to flip a card
        if (choice === "draw") {
            // console.log("Its : "+this.turn.id+"'s turn")
            this.flipCard()
        }
        // else this.turn.setStatus("standing");
        else this.turn.setStatus("MadeMove");
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
        let highestCardPlayer = null
        for(let i = 0; i < players.length; i++) {
            if(highestCardPlayer == null) {
                highestCardPlayer = players[i]
            }
            else {

                //Finds if the next player has the highest card
                if(highestCardPlayer.getLastCardFlipped().value > 
                    players[i].getLastCardFlipped().value) {
                        highestCardPlayer = players[i]
                } 
            }
        }
        return highestCardPlayer;
    }
  
    /**
     * Returns the number of turns needed for the initial
     * deal.
     * @param {*} playerSize - The number of players part of the game
     * @returns - The number of turns needed for the initial deal.
     */
    getTurns(playerSize) {
      return 52/playerSize;
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
  