// Admin-managed configuration for the book/article submission pages.
//
// Where it lives: the SAME Google Apps Script Web App that already receives
// submissions also serves/stores this config (in a "Config" tab of the sheet) —
// so an admin's changes are shared with every visitor, with no new server.
//   - read:  GET  <APPS_SCRIPT_URL>?action=getConfig   (public)
//   - write: POST { action:"setConfig", secret, config } (admin secret required)
//
// Fallbacks keep the site working no matter what: if the Apps Script isn't
// reachable (or not yet updated), we use the admin's last localStorage copy, and
// finally the hardcoded defaults below. So the submission page never breaks.
import {
  WORK_TYPE_OPTIONS,
  FACULTY_OPTIONS,
} from "../Components/book/submit-form/formOptions";
import { CONTACTS } from "../Components/book/submit-guidelines/guidelinesData";

const APPS_SCRIPT_URL = process.env.REACT_APP_SUBMIT_URL || "";
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

// True if submissions should be accepted right now (respects deadline auto-close).
export function isSubmissionOpen(cfg) {
  const c = mergeConfig(cfg);
  if (!c.open) return false;
  if (c.autoCloseOnDeadline && c.deadline) {
    const end = new Date(`${c.deadline}T23:59:59`);
    if (!Number.isNaN(end.getTime()) && Date.now() > end.getTime()) return false;
  }
  return true;
}

export async function fetchBookConfig() {
  if (APPS_SCRIPT_URL) {
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getConfig`);
      if (res.ok) {
        const data = await res.json();
        // Only trust a real config object (older deployments won't send one).
        if (data && data.config && typeof data.config === "object") {
          const cfg = mergeConfig(data.config);
          writeLocal(cfg);
          return cfg;
        }
      }
    } catch {
      /* fall through to local/defaults */
    }
  }
  return mergeConfig(readLocal());
}

// Saves config. Always caches locally; also syncs to the Apps Script when a URL
// and admin secret are provided. Returns { synced } so the UI can tell the admin
// whether the change reached everyone or is local-only.
export async function saveBookConfig(cfg, secret) {
  const merged = mergeConfig(cfg);
  writeLocal(merged);

  if (APPS_SCRIPT_URL && secret) {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "setConfig", secret, config: merged }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || result.status === "error") {
      throw new Error(result.message || "Apps Script rejected the save.");
    }
    return { synced: true };
  }
  return { synced: false };
}

export const HAS_REMOTE_CONFIG = !!APPS_SCRIPT_URL;
