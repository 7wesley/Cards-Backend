/**
 * Alerts users or modifies the current players in a game
 * depending on the statuses of a specific user.
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 10/28/2021
 */
module.exports = class GameLogic {
  constructor(io) {
    //This class is shared between all rooms so a socket can
    //not be set as a field. Instead it will be passed in to the functions.
    this.io = io;
  }

  /**
   * Checks the status of the socket passed in using the room's game
   * instance and then emits the appropriate message to the socket.
   * @param {*} socket - The current turn's socket
   * @param {*} game - The game instance of the current room
   */
  async war(socket, game) {
    if (game.getPlayer(socket.uid).getStatus() === "busted") {
      await this.removePlayer(socket, game, `${socket.uid} Busts!`);
    } else if (game.getPlayer(socket.uid).getStatus() === "standing") {
      await this.alert(socket, `${socket.uid} Stands!`);
    } else if (game.getPlayer(socket.uid).getStatus() === "playing") {
      await this.alert(socket, `this should be when a player quits again!`);
      // console.log("gameLogic: all players have moved (2)")

      let winner = game.getWinnerOfRound();
      await this.alert(
        socket,
        `${winner.getId()} Won the Round with the card
        ${winner.getLastCardFlipped().rank} of 
        ${winner.getLastCardFlipped().suit}`
      );
      game.resetLastCardFlipped();
    } else if (game.getPlayer(socket.uid).getStatus() === "madeMove") {
      //Do a check here
      await this.alert(
        socket,
        `${socket.uid} Flipped over a 
          ${game.getPlayer(socket.uid).getLastCardFlipped().rank} of 
          ${game.getPlayer(socket.uid).getLastCardFlipped().suit}`
      );

      //If all players have gone, then display the winner of the round
      if (game.ifAllPlayersMoved()) {
        // console.log("gameLogic: all players have moved")

        //If there is a tie between 2 or more players with the highest card value
        if (game.getTiedPlayers().length > 1) {
          //Do the Tie scenario
          await this.alert(socket, `This Means WAR!!!`);
          let declareWar = true;
          let tiedPlayers = game.getTiedPlayers();

          while (declareWar) {
            //Run through an instance of I De Clare War
            for (let i = 0; i < 4; i++) {
              game.declareWar(tiedPlayers);
              this.io
                .to(socket.room)
                .emit("update-hands", game.displayPlayers());

              if (i == 0) {
                await this.alert(socket, `I...`);
              } else if (i === 1) {
                await this.alert(socket, `De...`);
              } else if (i === 2) {
                await this.alert(socket, `Clare...`);
              } else if (i === 3) {
                await this.alert(socket, `War!!!`);
              }

              // console.log("i = "+ i)
              // console.log("game.getTiedPlayers().length = "+game.getTiedPlayers().length)

              //Finds if the players tied after a tie
              if (i == 3 && !game.ifStillTied(tiedPlayers)) {
                // console.log("gameLogic: Players are no longer tied")
                declareWar = false;
                // console.log("gameLogic: The War ended");
              }
            }
          }

          // console.log("gameLogic: before find the winner");
          let winner = game.getWinnerOfWar(tiedPlayers);
          // console.log("gameLogic: winner = " + winner.id);

          await this.alert(
            socket,
            `${winner.getId()} Won the Round with the card
            ${winner.getLastCardFlipped().rank} of 
            ${winner.getLastCardFlipped().suit}`
          );
          game.resetLastCardFlipped();
        }

        //There is no tie and can display the winner as usual
        else {
          let winner = game.getWinnerOfRound();
          await this.alert(
            socket,
            `${winner.getId()} Won the Round with the card
            ${winner.getLastCardFlipped().rank} of 
            ${winner.getLastCardFlipped().suit}`
          );
          game.resetLastCardFlipped();
        }
        // console.log("gameLogic: last msg, all players have moved ended")
      }
    } else if (game.getPlayer(socket.uid).getStatus() === "noCards") {
      await this.removePlayer(socket, game, `${socket.uid} is out of cards!`);
    }
    this.io.to(socket.room).emit("update-hands", game.displayPlayers());
  }

  /**
   * Sends an alert message that will be emitted to the room of
   * the socket passed in.
   * @param {*} socket - The current turn's socket
   * @param {*} msg - The alert message to be emitted
   */
  async alert(socket, msg) {
    this.io.to(socket.room).emit("alert", msg),
      await new Promise((resolve) => setTimeout(resolve, 3000));
    this.io.to(socket.room).emit("alert", "");
  }

  /**
   * Sends an alert message that will be emitted to the room of
   * the socket passed in, and also removes the socket passed in
   * from the game.
   * @param {*} socket - The current turn's socket
   * @param {*} game - The game instance of the current room
   * @param {*} msg - The alert message to be emitted
   */
  async removePlayer(socket, game, msg) {
    this.io.to(socket.room).emit("alert", msg),
      await new Promise((resolve) => setTimeout(resolve, 3000));
    game.removePlayer(socket.uid);
    this.io.to(socket.room).emit("alert", "");
  }
};
