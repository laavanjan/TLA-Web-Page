// Questions for the "TLA உதவி" assistant (src/Components/HelpBot): rows in the
// Supabase `faqs` table (see supabase/migrations/faq.sql), managed at
// /admin/faq. The topics stay in faqData.js (FAQ_CATEGORIES).
//
// When the table can't be read (faq.sql not run yet, or Supabase is down) the
// questions built into faqData.js are used, so the assistant always works.
//
// Each question can also be in English (q_en, a_en, a link's label_en) for the
// assistant's English mode; see inLanguage().
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../helpers/supabaseClient";
import { fetchContactConfig, getCachedContactConfig } from "../contactConfig";
import { FAQS, FAQ_CATEGORIES } from "./faqData";

const TABLE = "faqs";
// "*" rather than a column list, so a column added by a later faq.sql never
// breaks reading before the SQL has been run.
const COLUMNS = "*";
const LS_KEY = "tla_faqs_v2"; // v2: rows carry q_en / a_en

export { FAQ_CATEGORIES };
const CAT_IDS = FAQ_CATEGORIES.map((c) => c.id);

// The assistant's first tab, "பிரபலமானவை", shows these questions.
export const POPULAR_IDS = ["what-is-tla", "thamilaruvi", "sotkanai", "join-team", "submit-how", "contact"];
// The answer behind "எம்மைத் தொடர்பு கொள்ள" when a search finds nothing.
export const NOT_FOUND_ID = "not-found";

// The words an answer or link may use, filled in from the live settings.
export const FAQ_TOKENS = [
  ["email", "Email address (Contact info)"],
  ["phone", "Phone number (Contact info)"],
  ["phoneName", "Name for the phone number (Contact info)"],
  ["members", "How many members (Members page)"],
  ["facebookUrl", "Facebook link (Contact info)"],
  ["youtubeUrl", "YouTube link (Contact info)"],
  ["instagramUrl", "Instagram link (Contact info)"],
  ["linkedinUrl", "LinkedIn link (Contact info)"],
  ["xUrl", "X (Twitter) link (Contact info)"],
];
const TOKEN_NAMES = FAQ_TOKENS.map(([t]) => t);

// Shown for {members} until the count has loaded.
const MEMBERS_FALLBACK = { ta: "நூற்றுக்கணக்கான", en: "Hundreds of" };

// {email}, {members} … -> the live value. Unknown tokens stay as typed.
export const fillTokens = (text, ctx) =>
  String(text || "").replace(/\{(\w+)\}/g, (m, key) => (TOKEN_NAMES.includes(key) && ctx[key] ? ctx[key] : m));

// {tokens} in `text` that the site doesn't know (usually a typo).
export const unknownTokens = (text) =>
  [...new Set((String(text || "").match(/\{(\w+)\}/g) || []).map((m) => m.slice(1, -1)))].filter((t) => !TOKEN_NAMES.includes(t));

export const faqContext = (contact, members, lang = "ta") => ({
  ...contact,
  phone: contact.phoneNumber,
  members: members || MEMBERS_FALLBACK[lang] || MEMBERS_FALLBACK.ta,
});

// ---- Normalising ---------------------------------------------------------------------------

export const ID_RE = /^[a-z0-9][a-z0-9-]{1,59}$/;

// A fresh id for a new question (questions are Tamil, so no slug from the text).
export const newFaqId = () => `q-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// { label, to } for a page of this site, { label, href } for anything else.
export function normalizeLink(l) {
  const o = l || {};
  const label = typeof o.label === "string" ? o.label : "";
  const en = typeof o.label_en === "string" && o.label_en ? { label_en: o.label_en } : {};
  if (typeof o.to === "string" && o.to) return { label, ...en, to: o.to };
  return { label, ...en, href: typeof o.href === "string" ? o.href : "" };
}

// Whitelist + tidy so a bad row never breaks the assistant.
export function normalizeFaq(r) {
  const o = r || {};
  const str = (v) => (typeof v === "string" ? v : "");
  return {
    id: str(o.id),
    cat: CAT_IDS.includes(o.cat) ? o.cat : CAT_IDS[0],
    q: str(o.q),
    a: str(o.a),
    q_en: str(o.q_en),
    a_en: str(o.a_en),
    links: Array.isArray(o.links) ? o.links.map(normalizeLink) : [],
    kw: str(o.kw),
    sort_order: Number.isFinite(Number(o.sort_order)) ? Number(o.sort_order) : 0,
    is_visible: o.is_visible !== false,
    updated_at: o.updated_at || null,
  };
}

const byOrder = (a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id);

export const BUILT_IN_FAQS = FAQS.map((f, i) => normalizeFaq({ ...f, sort_order: i }));

// ---- English mode --------------------------------------------------------------------------

const BUILT_IN_BY_ID = new Map(BUILT_IN_FAQS.map((f) => [f.id, f]));
// The English for each Tamil link label used in the built-in questions.
const LINK_EN = new Map(BUILT_IN_FAQS.flatMap((f) => f.links.filter((l) => l.label_en).map((l) => [l.label, l.label_en])));

export const catLabel = (cat, lang) => {
  const c = FAQ_CATEGORIES.find((x) => x.id === cat);
  if (!c) return "";
  return lang === "en" && c.label_en ? c.label_en : c.label;
};

// A question as the visitor's language shows it: { q, a, links: [{ ...link,
// text }], english }. English comes from the question itself, or - if an admin
// hasn't changed its Tamil since - from the built-in copy, so English works
// even before faq.sql's English columns exist. A question with no English is
// shown in Tamil (english: false).
export function inLanguage(f, lang) {
  if (lang !== "en") return { q: f.q, a: f.a, links: f.links.map((l) => ({ ...l, text: l.label })), english: false };
  const base = BUILT_IN_BY_ID.get(f.id);
  const unchanged = !!base && base.q === f.q && base.a === f.a;
  const q = f.q_en || (unchanged ? base.q_en : "");
  const a = f.a_en || (unchanged ? base.a_en : "");
  const english = !!(q.trim() && a.trim());
  return {
    q: english ? q : f.q,
    a: english ? a : f.a,
    links: f.links.map((l) => ({ ...l, text: l.label_en || LINK_EN.get(l.label) || l.label })),
    english,
  };
}

// ---- Reading -------------------------------------------------------------------------------

// Visitors get the visible questions (row-level security); main admins get
// every one. Throws when the table can't be read.
export async function fetchFaqs() {
  const { data, error } = await supabase.from(TABLE).select(COLUMNS).order("sort_order", { ascending: true });
  if (error) throw new Error(error.message || "Couldn't read the questions.");
  return (data || []).map(normalizeFaq).sort(byOrder);
}

function readCache() {
  try {
    const list = JSON.parse(localStorage.getItem(LS_KEY));
    return Array.isArray(list) ? list.map(normalizeFaq).filter((f) => f.id && f.q) : null;
  } catch {
    return null;
  }
}

function writeCache(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

// Runs `load` the first time `enabled` is true, once per mount. Its answer
// still lands if `enabled` turns false again before it arrives (the
// assistant closed while loading).
function useLoadOnce(enabled, load) {
  const mounted = useRef(false);
  const started = useRef(false);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;
    loadRef.current(() => mounted.current);
  }, [enabled]);
}

// The questions visitors see, in order. Starts from the last answer (or the
// built-in questions) so the assistant opens instantly, then asks the
// database once `enabled` turns true.
export function useFaqs(enabled = true) {
  const [faqs, setFaqs] = useState(() => readCache() || BUILT_IN_FAQS);

  useLoadOnce(enabled, (alive) => {
    fetchFaqs()
      .then((rows) => {
        const list = rows.filter((f) => f.is_visible);
        writeCache(list);
        if (alive()) setFaqs(list);
      })
      .catch(() => {});
  });

  return faqs;
}

// What the {tokens} are filled with: the contact settings and the member
// count, loaded once `enabled` turns true.
export function useFaqContext(enabled = true, lang = "ta") {
  const [contact, setContact] = useState(getCachedContactConfig);
  const [members, setMembers] = useState("");

  useLoadOnce(enabled, (alive) => {
    fetchContactConfig()
      .then((c) => alive() && setContact(c))
      .catch(() => {});
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (alive() && !error && count > 0) setMembers(count.toLocaleString("en-US"));
      });
  });

  return useMemo(() => faqContext(contact, members, lang), [contact, members, lang]);
}

// ---- Writing (main admins) -----------------------------------------------------------------

// Row-level security turns "not allowed" into "0 rows", not an error.
function needRow(data) {
  if (!data || !data.length) throw new Error("Nothing was saved - only main admins can change the questions.");
}

// Links missing a label or an address are dropped.
const cleanLinks = (links) =>
  links
    .map(normalizeLink)
    .map((l) => {
      const label = { label: l.label.trim(), ...(l.label_en && l.label_en.trim() ? { label_en: l.label_en.trim() } : {}) };
      return l.to ? { ...label, to: l.to.trim() } : { ...label, href: l.href.trim() };
    })
    .filter((l) => l.label && (l.to || l.href));

// Adds the question when `isNew`, updates it otherwise; `sortOrder` (needed
// for a new one) moves it. -> the saved row.
export async function saveFaq(faq, { isNew = false, sortOrder } = {}) {
  const clean = normalizeFaq(faq);
  const body = {
    cat: clean.cat,
    q: clean.q.trim(),
    a: clean.a.trim(),
    q_en: clean.q_en.trim(),
    a_en: clean.a_en.trim(),
    links: cleanLinks(clean.links),
    kw: clean.kw.trim(),
    is_visible: clean.is_visible,
  };
  if (sortOrder !== undefined) body.sort_order = sortOrder;
  const write = (b) =>
    (isNew ? supabase.from(TABLE).insert({ ...b, id: clean.id }) : supabase.from(TABLE).update(b).eq("id", clean.id)).select(COLUMNS);
  let { data, error } = await write(body);
  if (error && error.code === "PGRST204" && /q_en|a_en/.test(error.message || "")) {
    // The English columns aren't in the table yet (an older faq.sql) - save the rest.
    const rest = { ...body };
    delete rest.q_en;
    delete rest.a_en;
    ({ data, error } = await write(rest));
  }
  if (error) throw new Error(error.message || "Could not save the question.");
  needRow(data);
  return normalizeFaq(data[0]);
}

export async function setFaqVisible(id, visible) {
  const { data, error } = await supabase.from(TABLE).update({ is_visible: visible }).eq("id", id).select("id");
  if (error) throw new Error(error.message || "Could not save.");
  needRow(data);
}

export async function removeFaq(id) {
  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id");
  if (error) throw new Error(error.message || "Could not delete.");
  needRow(data);
}

// `rows` is every question in the new order; numbers them 0..n-1, saving only
// what changed.
export async function saveFaqOrder(rows) {
  const results = await Promise.all(
    rows.map((r, i) => (r.sort_order === i ? null : supabase.from(TABLE).update({ sort_order: i }).eq("id", r.id)))
  );
  const failed = results.find((r) => r && r.error);
  if (failed) throw new Error(failed.error.message || "Could not save the order.");
}
