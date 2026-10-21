import { answerTips, firstSentence } from "./answerCheck";

const good = {
  q: "தமிழருவி என்றால் என்ன?",
  a: "தமிழருவி மன்றத்தின் மிகப்பெரிய கலை விழா.",
  q_en: "What is Thamilaruvi?",
  a_en: "Thamilaruvi is TLA's biggest arts festival, held in Colombo every year.",
};

test("a short, self-contained answer with English has no tips", () => {
  expect(answerTips(good)).toEqual([]);
});

test("an empty answer has no tips yet", () => {
  expect(answerTips({ q: "x?", a: "" })).toEqual([]);
});

test("missing English is flagged", () => {
  expect(answerTips({ ...good, a_en: "" }).join(" ")).toMatch(/No English yet/);
});

test("an answer starting with a pronoun or a list is flagged", () => {
  expect(answerTips({ ...good, a_en: "It is held in Colombo." }).join(" ")).toMatch(/starts with "It"/);
  expect(answerTips({ ...good, a: "இது ஒரு விழா." }).join(" ")).toMatch(/starts with "இது"/);
  expect(answerTips({ ...good, a: "• ஒன்று\n• இரண்டு" }).join(" ")).toMatch(/starts with a list/);
});

test("a long first sentence is flagged", () => {
  expect(answerTips({ ...good, a_en: `Thamilaruvi ${"is very ".repeat(40)}big.` }).join(" ")).toMatch(/first sentence is \d+ characters/);
});

test("firstSentence skips bullets and stops at the first full stop", () => {
  expect(firstSentence("\n• One. Two.")).toBe("One.");
  expect(firstSentence("No stop here")).toBe("No stop here");
});
