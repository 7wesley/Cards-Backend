const War = require("../../cards/War");
const Deck = require("../../cards/Deck");
const Player = require("../../cards/Player");
const Card = require("../../cards/Card");

describe("War tests", () => {
  let war;
  const deck = new Deck();

  beforeEach(() => {
    war = new War(deck);
  });

  it("Deck field is set", () => {
    expect(war.deck).toEqual(deck);
  });

  it("getWinners finds player with highest card value", () => {
    const player1 = new Player("test1");
    const player2 = new Player("test1");
    const card = new Card("H", "A");
    player2.setCards(card);
    expect(war.getWinners([player1, player2])).toHaveLength(1);
    expect(war.getWinners([player1, player2])).toEqual([player2]);
  });
});
