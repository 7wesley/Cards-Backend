/**
 * Alerts users or modifies the current players in a game
 * depending on the statuses of a specific user.
 * @author Nathan Jenkins
 * @author Wesley Miller
 * @version 5/13/2021
 */
module.exports = class GameLogic {
  constructor(io) {
    //This class is shared between all rooms so a socket can
    //not be set as a field. Instead it will be passed in to the functions.
    this.io = io;
  }

  /**
   * Checks the status of the socket passed in using the room's board
   * instance and then emits the appropriate message to the socket.
   * @param {*} socket - The current turn's socket
   * @param {*} board - The board instance of the current room
   */
  async blackjack(socket, board) {
    if (board.getPlayer(socket.uid).getStatus() === "busted") {
      await this.removePlayer(socket, board, `${socket.uid} Busts!`);
    } else if (board.getPlayer(socket.uid).getStatus() === "standing") {
      await this.alert(socket, `${socket.uid} Stands!`);
    }
    this.io.to(socket.room).emit("update-hands", board.getPlayers());
  }

    /**
   * Checks the status of the socket passed in using the room's board
   * instance and then emits the appropriate message to the socket.
   * @param {*} socket - The current turn's socket
   * @param {*} board - The board instance of the current room
   */
     async war(socket, board) {
      if (board.getPlayer(socket.uid).getStatus() === "busted") {
        await this.removePlayer(socket, board, `${socket.uid} Busts!`);
      } else if (board.getPlayer(socket.uid).getStatus() === "standing") {
        await this.alert(socket, `${socket.uid} Stands!`);
      } else if (board.getPlayer(socket.uid).getStatus() === "playing") {
        await this.alert(socket, `${socket.uid} drew a card!`);
      } else if (board.getPlayer(socket.uid).getStatus() === "madeMove") {
        await this.alert(socket, `${socket.uid} Flipped over a 
          ${board.getPlayer(socket.uid).getLastCardFlipped().rank} of 
          ${board.getPlayer(socket.uid).getLastCardFlipped().suit}`);
        if(board.ifAllPlayersMoved()) {
          console.log("gameLogic: about to call message")
          let winner = board.getWinnerOfRound()
          await this.alert(socket, `${winner.getId()} Won the Round with the card
            ${winner.getLastCardFlipped().rank} of 
            ${winner.getLastCardFlipped().suit}`);
          console.log(`${winner.getId()} Won the Round with the card
            ${winner.getLastCardFlipped().rank} of 
            ${winner.getLastCardFlipped().suit}`)
          console.log("gameLogic: after message")
        }
        // await this.alert(socket, `${socket.uid} wins the round`);
      } 
      this.io.to(socket.room).emit("update-hands", board.getPlayers());
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
   * from the board.
   * @param {*} socket - The current turn's socket
   * @param {*} board - The board instance of the current room
   * @param {*} msg - The alert message to be emitted
   */
  async removePlayer(socket, board, msg) {
    this.io.to(socket.room).emit("alert", msg),
      await new Promise((resolve) => setTimeout(resolve, 3000));
    board.removePlayer(socket.uid);
    this.io.to(socket.room).emit("alert", "");
  }
};
