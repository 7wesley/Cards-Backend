const Blackjack = require("../../cards/Blackjack");
const Card = require("../../cards/Card");
const Player = require("../../cards/Player");

describe("Blackjack tests", () => {
  let blackjack;
  const bank = 600;
  const players = ["test1", "test2"];

  beforeEach(() => {
    blackjack = new Blackjack(null, null, players, bank);
  });

  it("getTotal returns '11' for single ace", () => {
    const player = new Player(test[0]);
    const card = new Card("H", "A");
    player.addCards(card);
    expect(blackjack.getTotal(player)).toBe(11);
  });
});
