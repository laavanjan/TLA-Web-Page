// Configuration for the book/article submission pages. Frontend-only: there is
// no backend, so the admin page's edits are saved in the admin's own browser
// (localStorage) and act as a live preview on that device.
//
// The ONE setting that must apply to EVERY visitor — whether submissions are
// open — is a build-time flag below. Flip SUBMISSIONS_OPEN and redeploy to
// open/close the form site-wide (a per-browser toggle can't reach other people).
import {
  WORK_TYPE_OPTIONS,
  FACULTY_OPTIONS,
} from "../Components/book/submit-form/formOptions";
import { CONTACTS } from "../Components/book/submit-guidelines/guidelinesData";

// ⇩⇩ SITE-WIDE ON/OFF SWITCH — set to false to close submissions for everyone,
//    then `git push` to deploy. Set back to true to re-open. ⇩⇩
export const SUBMISSIONS_OPEN = true;

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

// Frontend-only: config comes from this browser's saved copy (or defaults).
export async function fetchBookConfig() {
  return mergeConfig(readLocal());
}

// Saves config to this browser only (localStorage). `synced` is always false —
// there is no backend, so it never publishes to other visitors.
export async function saveBookConfig(cfg) {
  const merged = mergeConfig(cfg);
  writeLocal(merged);
  return { synced: false };
}

export const HAS_REMOTE_CONFIG = false;
