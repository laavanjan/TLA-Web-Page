// The help assistant's questions and answers (the Supabase `faqs` table, edited
// at /admin/faq) for the build: written into faq.html and llms.txt so answer
// engines that don't run JavaScript (ChatGPT, Perplexity, Claude…) can read
// them. Follows src/shared/faq/faqs.js - same English fallback, same {tokens}.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SRC = path.join(__dirname, "../../src");

// Evaluates one of the app's plain-data ES modules (no imports) and returns the
// names asked for. The app's files stay the single source.
function readModule(file, names) {
  const code = fs.readFileSync(path.join(SRC, file), "utf8").replace(/^export\s+/gm, "");
  return vm.runInNewContext(`${code}\n;({ ${names.join(", ")} })`, {}, { filename: file });
}

const { FAQS, FAQ_CATEGORIES } = readModule("shared/faq/faqData.js", ["FAQS", "FAQ_CATEGORIES"]);

// DEFAULT_CONTACT_CONFIG from contactConfig.js (that file imports Supabase, so
// only the object is read).
function defaultContact() {
  const src = fs.readFileSync(path.join(SRC, "shared/contactConfig.js"), "utf8");
  const m = src.match(/DEFAULT_CONTACT_CONFIG\s*=\s*(\{[\s\S]*?\n\});/);
  return m ? vm.runInNewContext(`(${m[1]})`, {}) : {};
}

const str = (v) => (typeof v === "string" ? v : "");
const NOT_FOUND_ID = "not-found";
const MEMBERS_FALLBACK = { ta: "நூற்றுக்கணக்கான", en: "Hundreds of" };
const TOKEN_NAMES = ["email", "phone", "phoneName", "members", "facebookUrl", "youtubeUrl", "instagramUrl", "linkedinUrl", "xUrl"];

const BUILT_IN = new Map(FAQS.map((f) => [f.id, f]));

// The same rule as inLanguage() in faqs.js: a question's own English, or the
// built-in English while its Tamil hasn't been changed.
function english(f) {
  const base = BUILT_IN.get(f.id);
  const unchanged = !!base && base.q === f.q && base.a === f.a;
  const q = str(f.q_en) || (unchanged ? str(base.q_en) : "");
  const a = str(f.a_en) || (unchanged ? str(base.a_en) : "");
  return q.trim() && a.trim() ? { q, a } : null;
}

// {email}, {members} … -> the live value; a token with no value is left out
// rather than shown as "{email}".
function filler(contact, members, lang) {
  const ctx = { ...contact, phone: contact.phoneNumber, members: members || MEMBERS_FALLBACK[lang] };
  return (text) => String(text || "").replace(/\{(\w+)\}/g, (m, key) => (TOKEN_NAMES.includes(key) ? ctx[key] || "" : m));
}

// [{ id, label, label_en, items: [{ id, q, a, en: { q, a } | null }] }], in the
// assistant's order, visible questions only.
function faqGroups(rows, contact, members) {
  const ta = filler(contact, members, "ta");
  const en = filler(contact, members, "en");
  const list = (rows.length ? rows : FAQS.map((f, i) => ({ ...f, sort_order: i })))
    .filter((f) => f && f.is_visible !== false && f.id !== NOT_FOUND_ID && str(f.q) && str(f.a))
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || String(a.id).localeCompare(String(b.id)));
  return FAQ_CATEGORIES.map((c) => ({
    ...c,
    items: list
      .filter((f) => f.cat === c.id)
      .map((f) => {
        const e = english(f);
        return { id: f.id, q: ta(f.q), a: ta(f.a), en: e ? { q: en(e.q), a: en(e.a) } : null };
      }),
  })).filter((g) => g.items.length);
}

// Bullets and double spaces out, for structured data and llms.txt prose.
const plain = (s) =>
  String(s || "")
    .split("\n")
    .map((l) => l.replace(/^\s*[•\-–]\s+/, "").trim())
    .filter(Boolean)
    .join(" ");

// The FAQPage structured data, built the way Faq.js builds it.
function faqSchema(groups, siteUrl) {
  const mainEntity = [];
  groups.forEach((g) =>
    g.items.forEach((f) => {
      mainEntity.push({
        "@type": "Question",
        name: f.q,
        inLanguage: "ta",
        acceptedAnswer: { "@type": "Answer", text: plain(f.a), inLanguage: "ta" },
      });
      if (f.en) {
        mainEntity.push({
          "@type": "Question",
          name: f.en.q,
          inLanguage: "en",
          acceptedAnswer: { "@type": "Answer", text: plain(f.en.a), inLanguage: "en" },
        });
      }
    })
  );
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/faq#faq`,
    url: `${siteUrl}/faq`,
    about: { "@id": `${siteUrl}/#org` },
    mainEntity,
  };
}

module.exports = { faqGroups, faqSchema, plain, defaultContact, FAQS, FAQ_CATEGORIES };
