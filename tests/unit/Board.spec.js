const Board = require("../../cards/Board");
const Player = require("../../cards/Player");

describe("Board tests", () => {
  let board;
  const game = "blackjack";
  const players = {
    test1: "test1",
    test2: "test2",
  };

  beforeEach(() => {
    board = new Board(game, players);
  });

  it("Get players has player IDs", () => {
    let boardPlayers = board.getPlayers().map((p) => p.id);
    expect(boardPlayers).toContain("test1");
    expect(boardPlayers).toContain("test2");
  });

  it("Remove players gets rid of player", () => {
    board.removePlayer("test1");
    let boardPlayers = board.getPlayers().map((p) => p.id);
    expect(boardPlayers).not.toContain("test1");
  });

  it("Get player returns specific player", () => {
    let player = new Player("test1");
    expect(board.getPlayer("test1")).toEqual(player);
  });

  it("Is playing returns true for active player", () => {
    let isPlaying = board.isPlaying("test1");
    expect(isPlaying).toBe(true);
  });
});
