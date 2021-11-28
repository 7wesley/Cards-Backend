const War = require("../../cards/War");
const Player = require("../../cards/Player");
const Card = require("../../cards/Card");

describe("War tests", () => {
  let war;
  const bank = 600;
  const players = ["test1", "test2"];

  beforeEach(() => {
    war = new War(null, null, players, bank);
  });

  it("getTotal returns '14' for ace", () => {
    const player = new Player(test[0]);
    const card = new Card("H", "A");
    player.addCards(card);
    expect(war.getTotal(player)).toBe(14);
  });
});
