const Deck = require("../../cards/Deck");
var cloneDeep = require("lodash.clonedeep");

describe("Deck tests", () => {
  let deck;

  beforeEach(() => {
    deck = new Deck();
  });

  it("Deck cards are length 52", () => {
    expect(deck.cards.length).toBe(52);
  });

  it("Deal returns top card", () => {
    const card = deck.cards[51];
    expect(deck.deal()).toEqual(card);
  });

  it("Deal reduces deck size", () => {
    deck.deal();
    expect(deck.cards.length).toBe(51);
  });

  it("Shuffle changes deck order", () => {
    let cards = cloneDeep(deck.cards);
    deck.shuffle();
    expect(deck.cards).not.toEqual(cards);
  });
});
