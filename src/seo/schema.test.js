import { breadcrumbs, parseEventDate, eventSchemas, bookSchema } from "./schema";

test("dates typed in Tamil or English are understood, unclear ones are skipped", () => {
  expect(parseEventDate("2026-03-15")).toBe("2026-03-15");
  expect(parseEventDate("15/03/2026")).toBe("2026-03-15");
  expect(parseEventDate("15 March 2026, 5 pm")).toBe("2026-03-15");
  expect(parseEventDate("March 15, 2026")).toBe("2026-03-15");
  expect(parseEventDate("2026 மார்ச் 15")).toBe("2026-03-15");
  expect(parseEventDate("15–16 அக்டோபர் 2025")).toBe("2025-10-15");
  expect(parseEventDate("தை மாதம் 2026")).toBe("");
  expect(parseEventDate("31/02/2026")).toBe("");
  expect(parseEventDate("Every year")).toBe("");
  expect(parseEventDate("")).toBe("");
});

test("breadcrumbs follow the real pages above this one", () => {
  const titles = { "/events/brammam": "பிரம்மம்", "/books": "நூல்கள்" };
  const b = breadcrumbs("/events/brammam/meerigai", "மீரிகை", titles);
  expect(b.itemListElement.map((i) => i.name)).toEqual(["முகப்பு", "பிரம்மம்", "மீரிகை"]);
  expect(b.itemListElement[2].item).toBe("https://tlauom.com/events/brammam/meerigai");
  expect(breadcrumbs("/books/tla26", "TLA 26", titles).itemListElement.map((i) => i.name)).toEqual(["முகப்பு", "நூல்கள்", "TLA 26"]);
  expect(breadcrumbs("/", "Home", titles)).toBe(null);
});

test("an event is only described when it has a date and a place", () => {
  const page = {
    id: "thamilaruvi",
    title: "தமிழருவி",
    summary: "கலை நிகழ்வு",
    image: "asset:card/thamilaruvi",
    sections: [
      { type: "intro", date: "15 March 2026", venue: "BMICH, Colombo", text: "…" },
      {
        type: "competitions",
        items: [
          { id: "c1", name: "Debate", date: "2026-02-01", venue: "UoM", description: "" },
          { id: "c2", name: "Essay", date: "", venue: "Online" },
        ],
      },
    ],
  };
  const out = eventSchemas(page, "https://tlauom.com/events/thamilaruvi");
  expect(out).toHaveLength(2);
  expect(out[0]).toMatchObject({ "@type": "Event", name: "தமிழருவி", startDate: "2026-03-15", image: ["https://tlauom.com/og/thamilaruvi.jpg"] });
  expect(out[0].location.name).toBe("BMICH, Colombo");
  expect(out[1]).toMatchObject({ startDate: "2026-02-01", url: "https://tlauom.com/events/thamilaruvi#c1" });
  expect(eventSchemas({ ...page, sections: [{ type: "intro", date: "15 March 2026", venue: "" }] }, "u")).toEqual([]);
  expect(eventSchemas({ ...page, sections: [{ type: "intro", date: "15 March 2026", venue: "X", hidden: true }] }, "u")).toEqual([]);
});

test("books name their author, or TLA when there is none", () => {
  const b = bookSchema({ slug: "tla26", title: "TLA 26", year: 2026, author: "" }, "/images/c.webp");
  expect(b).toMatchObject({ "@type": "Book", name: "TLA 26", datePublished: "2026", image: "https://tlauom.com/images/c.webp" });
  expect(b.author["@type"]).toBe("Organization");
  expect(bookSchema({ slug: "x", title: "X", author: "கவிஞர்" }).author).toEqual({ "@type": "Person", name: "கவிஞர்" });
});
