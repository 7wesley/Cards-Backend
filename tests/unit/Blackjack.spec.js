const Blackjack = require("../../cards/Blackjack");
const Card = require("../../cards/Card");
const Deck = require("../../cards/Deck");
const Player = require("../../cards/Player");

describe("Blackjack tests", () => {
  let blackjack;
  const deck = new Deck();

  beforeEach(() => {
    blackjack = new Blackjack(deck);
  });

  it("Deck field is set", () => {
    expect(blackjack.deck).toEqual(deck);
  });

  it("getWinners finds player with highest card value", () => {
    const player1 = new Player("test1");
    const player2 = new Player("test1");
    const card = new Card("H", "A");
    player2.setCards(card);
    expect(blackjack.getWinners([player1, player2])).toHaveLength(1);
    expect(blackjack.getWinners([player1, player2])).toEqual([player2]);
  });
});
