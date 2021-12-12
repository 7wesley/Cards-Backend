const Game = require("../../cards/Game");
const Player = require("../../cards/Player");

describe("Game tests", () => {
  let game;
  const bank = 600;
  const players = {
    test1: { username: "test1", image: "default" },
    test2: { username: "test2", image: "default" },
  };

  beforeEach(() => {
    game = new Game(null, null, players, bank);
  });

  it("Get players has player IDs", () => {
    let player = game.getPlayer(players["test1"].username);
    expect(player).not.toBeNull;
    expect(player.getId()).toBe(players["test1"].username);
  });

  it("Remove players gets rid of player", () => {
    game.removePlayer(players[0]);
    let player = game.getPlayer(players[0]);
    expect(player).toBeNull;
  });

  it("Get player returns specific player", () => {
    let player = new Player(players["test1"].username, "default");
    player.updateBank(bank);
    expect(game.getPlayer(players["test1"].username)).toEqual(player);
  });
});
