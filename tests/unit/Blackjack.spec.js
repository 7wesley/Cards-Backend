const Blackjack = require("../../cards/Blackjack");
const Deck = require("../../cards/Deck");

describe("Blackjack tests", () => {
  let blackjack;
  const deck = new Deck();

  beforeEach(() => {
    blackjack = new Blackjack(deck);
  });

  it("Deck field is set", () => {
    expect(blackjack.deck).toEqual(deck);
  });
});
