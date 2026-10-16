import fs from "fs";
import path from "path";
import {
  BUILT_IN_FAQS,
  FAQ_CATEGORIES,
  ID_RE,
  POPULAR_IDS,
  NOT_FOUND_ID,
  fillTokens,
  unknownTokens,
  normalizeFaq,
  normalizeLink,
  newFaqId,
} from "./faqs";

describe("built-in questions (the fallback, and what faq.sql seeds)", () => {
  test("70 questions with unique, valid ids in known topics", () => {
    expect(BUILT_IN_FAQS).toHaveLength(70);
    expect(new Set(BUILT_IN_FAQS.map((f) => f.id)).size).toBe(70);
    const cats = FAQ_CATEGORIES.map((c) => c.id);
    BUILT_IN_FAQS.forEach((f) => {
      expect(f.id).toMatch(ID_RE);
      expect(cats).toContain(f.cat);
      expect(f.q.trim()).not.toBe("");
      expect(f.a.trim()).not.toBe("");
    });
  });

  test("the popular picks and the no-match answer exist", () => {
    const ids = BUILT_IN_FAQS.map((f) => f.id);
    POPULAR_IDS.forEach((id) => expect(ids).toContain(id));
    expect(ids).toContain(NOT_FOUND_ID);
  });

  test("every {token} they use is one the site fills in", () => {
    BUILT_IN_FAQS.forEach((f) => {
      const text = [f.a, ...f.links.map((l) => `${l.label} ${l.to || l.href}`)].join(" ");
      expect(unknownTokens(text)).toEqual([]);
    });
  });

  test("faq.sql seeds the same questions, in the same order", () => {
    const sql = fs.readFileSync(path.join(__dirname, "../../../supabase/migrations/faq.sql"), "utf8");
    const seeded = sql
      .split(/\r?\n/)
      .map((line) => line.match(/^ {2}\('([a-z0-9-]+)', '[a-z]+',$/))
      .filter(Boolean)
      .map((m) => m[1]);
    expect(seeded).toEqual(BUILT_IN_FAQS.map((f) => f.id));
  });
});

describe("tokens", () => {
  const ctx = { email: "a@b.lk", members: "1,234" };

  test("known tokens are filled, unknown ones stay as typed", () => {
    expect(fillTokens("{email} - {members} - {emial}", ctx)).toBe("a@b.lk - 1,234 - {emial}");
  });

  test("unknownTokens lists each misspelt token once", () => {
    expect(unknownTokens("{email} {emial} {emial} {phoneName}")).toEqual(["emial"]);
  });
});

describe("normalizeFaq", () => {
  test("tidies a bad row instead of breaking", () => {
    const f = normalizeFaq({ id: "x-1", cat: "nope", q: 5, links: "no", is_visible: null });
    expect(f).toMatchObject({ id: "x-1", cat: FAQ_CATEGORIES[0].id, q: "", a: "", links: [], kw: "", is_visible: true });
  });

  test("keeps a link's kind", () => {
    expect(normalizeLink({ label: "A", to: "/contact" })).toEqual({ label: "A", to: "/contact" });
    expect(normalizeLink({ label: "B", href: "{facebookUrl}" })).toEqual({ label: "B", href: "{facebookUrl}" });
  });

  test("new ids are valid", () => {
    expect(newFaqId()).toMatch(ID_RE);
  });
});
