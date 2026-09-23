// Configuration for the book/article submission pages. The admin page's
// edits are saved to a single row in the Supabase `book_config` table (see
// supabase/migrations/book_config.sql), so they're live for every visitor —
// not just the admin's own browser.
//
// SUBMISSIONS_OPEN below is a separate, build-time hard override: it can
// force-close the form even if the database says otherwise (e.g. the DB is
// unreachable, or you want an override that doesn't depend on it at all).
// The `open` toggle in the admin page is the normal day-to-day switch now.
import {
  WORK_TYPE_OPTIONS,
  FACULTY_OPTIONS,
} from "../Components/book/submit-form/formOptions";
import { CONTACTS } from "../Components/book/submit-guidelines/guidelinesData";
import { supabase } from "../helpers/supabaseClient";

// ⇩⇩ HARD SITE-WIDE OVERRIDE — set to false to force-close submissions for
//    everyone regardless of the admin page, then `git push` to deploy. ⇩⇩
export const SUBMISSIONS_OPEN = true;

const CONFIG_ROW_ID = 1;

const LS_KEY = "tla_book_config";

// Dropdown lists are stored as items { name, hidden } so an option can be
// hidden from the form without deleting it.
const toItems = (arr) => arr.map((name) => ({ name, hidden: false }));

function normalizeList(v, fallbackItems) {
  const arr = Array.isArray(v) ? v : null;
  if (!arr || !arr.length) return fallbackItems;
  return arr.map((it) =>
    typeof it === "string"
      ? { name: it, hidden: false }
      : { name: String((it && it.name) || ""), hidden: !!(it && it.hidden) }
  );
}

// Visible option names for the public form (skips hidden/empty).
export function visibleOptions(list) {
  return (list || [])
    .filter((o) => o && !o.hidden && String(o.name).trim())
    .map((o) => o.name);
}

// Contacts shown on the guidelines page: [{ name, phone }].
function normalizeContacts(v, fallback) {
  if (!Array.isArray(v)) return fallback;
  return v.map((it) => ({
    name: String((it && it.name) || ""),
    phone: String((it && it.phone) || ""),
  }));
}

export const DEFAULT_BOOK_CONFIG = {
  open: true, // accepting submissions?
  deadline: "", // "" = none, else "YYYY-MM-DD"
  autoCloseOnDeadline: true, // close automatically once the deadline passes
  announcement: "", // optional notice shown on the pages
  workTypes: toItems(WORK_TYPE_OPTIONS),
  faculties: toItems(FACULTY_OPTIONS),
  contacts: CONTACTS.map((c) => ({ name: c.name, phone: c.phone })),
  maxDocMB: 10,
  maxPhotoMB: 5,
};

// Whitelist + validate known keys so an unexpected response never pollutes or
// breaks the config.
export function mergeConfig(partial) {
  const p = partial || {};
  const d = DEFAULT_BOOK_CONFIG;
  return {
    open: typeof p.open === "boolean" ? p.open : d.open,
    deadline: typeof p.deadline === "string" ? p.deadline : d.deadline,
    autoCloseOnDeadline:
      typeof p.autoCloseOnDeadline === "boolean"
        ? p.autoCloseOnDeadline
        : d.autoCloseOnDeadline,
    announcement: typeof p.announcement === "string" ? p.announcement : d.announcement,
    workTypes: normalizeList(p.workTypes, d.workTypes),
    faculties: normalizeList(p.faculties, d.faculties),
    contacts: normalizeContacts(p.contacts, d.contacts),
    maxDocMB: Number(p.maxDocMB) > 0 ? Number(p.maxDocMB) : d.maxDocMB,
    maxPhotoMB: Number(p.maxPhotoMB) > 0 ? Number(p.maxPhotoMB) : d.maxPhotoMB,
  };
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(cfg) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
}

// Last-known config, synchronously (cache or defaults) — use as initial state
// so pages render instantly without an open→closed flash while the fetch runs.
export function getCachedConfig() {
  return mergeConfig(readLocal());
}

// True if submissions should be accepted right now. The build-time
// SUBMISSIONS_OPEN flag is the site-wide master; the per-browser `open` toggle
// and the deadline can only narrow it further.
export function isSubmissionOpen(cfg) {
  if (!SUBMISSIONS_OPEN) return false;
  const c = mergeConfig(cfg);
  if (!c.open) return false;
  if (c.autoCloseOnDeadline && c.deadline) {
    const end = new Date(`${c.deadline}T23:59:59`);
    if (!Number.isNaN(end.getTime()) && Date.now() > end.getTime()) return false;
  }
  return true;
}

// Reads the shared config from Supabase, falling back to the local cache (or
// defaults) if the row can't be reached — e.g. offline, or not migrated yet.
export async function fetchBookConfig() {
  const { data, error } = await supabase
    .from("book_config")
    .select("data")
    .eq("id", CONFIG_ROW_ID)
    .single();

  if (error || !data) {
    return getCachedConfig();
  }

  const merged = mergeConfig(data.data);
  writeLocal(merged);
  return merged;
}

// Publishes config to Supabase — live for every visitor. Requires a signed-in
// admin session (RLS only allows authenticated writes; see the migration).
export async function saveBookConfig(cfg) {
  const merged = mergeConfig(cfg);
  const { error } = await supabase
    .from("book_config")
    .update({ data: merged, updated_at: new Date().toISOString() })
    .eq("id", CONFIG_ROW_ID);

  if (error) {
    throw new Error(error.message || "Could not save.");
  }

  writeLocal(merged);
  return { synced: true };
}

export const HAS_REMOTE_CONFIG = true;
