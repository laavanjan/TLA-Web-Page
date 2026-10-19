import { absoluteUrl, clip } from "./site";

test("addresses become full canonical links", () => {
  expect(absoluteUrl("/")).toBe("https://tlauom.com/");
  expect(absoluteUrl("/books/")).toBe("https://tlauom.com/books");
  expect(absoluteUrl("books?x=1#y")).toBe("https://tlauom.com/books");
  expect(absoluteUrl("https://res.cloudinary.com/a.jpg")).toBe("https://res.cloudinary.com/a.jpg");
});

test("descriptions are cut at a word, not in the middle of one", () => {
  expect(clip("  short   text ")).toBe("short text");
  const long = "தமிழ் ".repeat(60);
  const out = clip(long);
  expect(out.length).toBeLessThanOrEqual(160);
  expect(out.endsWith("…")).toBe(true);
  expect(out).not.toMatch(/\s…$/);
});
