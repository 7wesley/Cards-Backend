const Game = require("../../cards/Game");
const Player = require("../../cards/Player");

describe("Game tests", () => {
  let game;
  const bank = 600;
  const players = ["test1", "test2"];

  beforeEach(() => {
    game = new Game(null, null, players, bank);
  });

  it("Get players has player IDs", () => {
    let player = game.getPlayer(players[0]);
    expect(player).not.toBeNull;
    expect(player.getId()).toBe(players[0]);
  });

  it("Remove players gets rid of player", () => {
    game.removePlayer(players[0]);
    let player = game.getPlayer(players[0]);
    expect(player).toBeNull;
  });

  it("Get player returns specific player", () => {
    let player = new Player(players[0]);
    player.updateBank(bank);
    expect(game.getPlayer(players[0])).toEqual(player);
  });
});
