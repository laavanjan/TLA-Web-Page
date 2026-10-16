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
  inLanguage,
  catLabel,
  faqContext,
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

describe("English mode", () => {
  test("every built-in question, topic and link has English", () => {
    BUILT_IN_FAQS.forEach((f) => {
      expect(f.q_en.trim()).not.toBe("");
      expect(f.a_en.trim()).not.toBe("");
      f.links.forEach((l) => expect((l.label_en || "").trim()).not.toBe(""));
      expect(unknownTokens([f.a_en, ...f.links.map((l) => l.label_en)].join(" "))).toEqual([]);
    });
    FAQ_CATEGORIES.forEach((c) => expect(catLabel(c.id, "en")).not.toBe(c.label));
  });

  test("Tamil mode shows the Tamil", () => {
    const f = BUILT_IN_FAQS[0];
    expect(inLanguage(f, "ta")).toMatchObject({ q: f.q, a: f.a, english: false });
  });

  test("a question's own English is used", () => {
    const f = normalizeFaq({ id: "x-1", q: "கே", a: "ப", q_en: "Q", a_en: "A", links: [{ label: "இ", label_en: "Link", to: "/" }] });
    expect(inLanguage(f, "en")).toMatchObject({ q: "Q", a: "A", english: true });
    expect(inLanguage(f, "en").links[0].text).toBe("Link");
  });

  test("a stored copy without English borrows the built-in English while its Tamil is unchanged", () => {
    const base = BUILT_IN_FAQS.find((f) => f.id === "sotkanai");
    const row = normalizeFaq({ ...base, q_en: "", a_en: "", links: base.links.map(({ label, to, href }) => ({ label, to, href })) });
    expect(inLanguage(row, "en")).toMatchObject({ q: base.q_en, a: base.a_en, english: true });
    expect(inLanguage(row, "en").links[0].text).toBe(base.links[0].label_en);
  });

  test("once the Tamil is edited, an old English copy isn't borrowed - the Tamil is shown", () => {
    const base = BUILT_IN_FAQS.find((f) => f.id === "sotkanai");
    const row = normalizeFaq({ ...base, a: base.a + " (புதிய தகவல்)", q_en: "", a_en: "" });
    expect(inLanguage(row, "en")).toMatchObject({ q: row.q, a: row.a, english: false });
  });

  test("{members} has an English fallback", () => {
    expect(faqContext({ phoneNumber: "1" }, "", "en").members).toBe("Hundreds of");
    expect(faqContext({ phoneNumber: "1" }, "821", "en").members).toBe("821");
  });

  test("a link keeps its English label", () => {
    expect(normalizeLink({ label: "A", label_en: "B", to: "/x" })).toEqual({ label: "A", label_en: "B", to: "/x" });
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
