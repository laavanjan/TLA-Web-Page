// Maintenance mode: one row in the Supabase `site_status` table (see
// supabase/migrations/site_status.sql). Edited at /admin/maintenance, read by
// the gate in App.js on every visit.
//
// The gate fails open: if the setting can't be read (database down, offline),
// the site is shown rather than a maintenance page nobody can switch off.
import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";

const LS_KEY = "tla_site_status";
const ROW_ID = 1;

// A saved answer younger than this is trusted at once, so a returning visitor
// sees the right thing on first paint. Older (or none) means waiting for the
// database - briefly.
const FRESH_MS = 10 * 60 * 1000;
const WAIT_MS = 1200;
export const POLL_MS = 60 * 1000;

export const DEFAULT_SITE_STATUS = { enabled: false, title: "", message: "", reopensAt: "" };

// Shown when the admin leaves the heading / message empty.
export const DEFAULT_TITLE = "பராமரிப்புப் பணிகள் நடைபெறுகின்றன";
export const DEFAULT_TITLE_EN = "We'll be right back";
export const DEFAULT_MESSAGE = "தமிழ் இலக்கிய மன்ற இணையதளம் தற்போது புதுப்பிக்கப்படுகிறது. சிறிது நேரத்தில் மீண்டும் வருவோம். பொறுமைக்கு நன்றி!";
export const DEFAULT_MESSAGE_EN = "Our website is being updated. Thank you for your patience - we'll be back shortly.";

// Whitelist + validate known keys so an unexpected response never breaks the site.
export function mergeStatus(partial) {
  const p = partial || {};
  const time = typeof p.reopensAt === "string" ? Date.parse(p.reopensAt) : NaN;
  return {
    enabled: p.enabled === true,
    title: typeof p.title === "string" ? p.title.trim().slice(0, 120) : "",
    message: typeof p.message === "string" ? p.message.trim().slice(0, 1000) : "",
    reopensAt: Number.isNaN(time) ? "" : new Date(time).toISOString(),
  };
}

// Is the maintenance page showing right now? A reopening time that has passed
// opens the site by itself, even if nobody switched it off.
export function isMaintenanceOn(status, now = Date.now()) {
  if (!status || !status.enabled) return false;
  return !status.reopensAt || now < Date.parse(status.reopensAt);
}

// What the gate in App.js should draw. Pure, so it can be tested.
//   path ....... location.pathname - the admin area is never blocked
//   ready ...... the setting has been read (or given up on)
//   on ......... isMaintenanceOn(...)
//   staff ...... "checking" | "staff" | "visitor" | "idle"
// -> "site" | "splash" | "maintenance" | "site-with-banner"
export function gateView({ path, ready, on, staff }) {
  if (path === "/admin" || path.startsWith("/admin/")) return "site";
  if (!ready) return "splash";
  if (!on) return "site";
  if (staff === "checking") return "splash";
  if (staff === "staff") return "site-with-banner";
  return "maintenance";
}

// ---- Saved copy ---------------------------------------------------------------------

function readCache() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(status) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ status, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

// The last answer if it is recent enough to trust, else null.
function freshCache() {
  const c = readCache();
  return c && c.status && Date.now() - c.at < FRESH_MS ? mergeStatus(c.status) : null;
}

export function getCachedSiteStatus() {
  const c = readCache();
  return c && c.status ? mergeStatus(c.status) : { ...DEFAULT_SITE_STATUS };
}

// Throws when it can't be read, so the caller can tell "off" from "unknown".
export async function fetchSiteStatus() {
  const { data, error } = await supabase.from("site_status").select("data").eq("id", ROW_ID).single();
  if (error || !data) throw new Error((error && error.message) || "Couldn't read the maintenance setting.");
  const status = mergeStatus(data.data);
  writeCache(status);
  return status;
}

// Live for every visitor on save. Main admins only (row-level security).
export async function saveSiteStatus(cfg) {
  const status = mergeStatus(cfg);
  const { data, error } = await supabase
    .from("site_status")
    .update({ data: status, updated_at: new Date().toISOString() })
    .eq("id", ROW_ID)
    .select("id");
  if (error) throw new Error(error.message || "Could not save.");
  // Row-level security turns "not allowed" into "0 rows", not an error.
  if (!data || !data.length) throw new Error("Nothing was saved - only main admins can change this.");
  writeCache(status);
  return status;
}

// ---- Hooks -----------------------------------------------------------------------------

// { status, ready }. Starts from a fresh saved answer if there is one, then
// asks the database, and asks again every minute and when the tab comes back.
export function useSiteStatus() {
  const [state, setState] = useState(() => {
    const cached = freshCache();
    return { status: cached || DEFAULT_SITE_STATUS, ready: !!cached };
  });

  useEffect(() => {
    let alive = true;
    const load = (first) =>
      fetchSiteStatus()
        .then((status) => alive && setState({ status, ready: true }))
        .catch(() => {
          // Never read it at all: open. A later hiccup keeps what we knew.
          if (alive) setState((cur) => (first ? { status: DEFAULT_SITE_STATUS, ready: true } : { ...cur, ready: true }));
        });
    load(true);

    const wait = setTimeout(() => alive && setState((cur) => (cur.ready ? cur : { ...cur, ready: true })), WAIT_MS);
    const poll = setInterval(() => document.visibilityState !== "hidden" && load(false), POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && load(false);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearTimeout(wait);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return state;
}

// The current time, refreshed every `ms`, so a reopening time takes effect
// without a reload.
export function useNow(ms = 15000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

// ---- Wording ------------------------------------------------------------------------------

export function formatReopen(iso, locale = "ta-LK") {
  return new Date(iso).toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// For the activity log: what changed between two saved versions.
export function summarizeStatusChange(before, after) {
  const b = mergeStatus(before);
  const a = mergeStatus(after);
  const out = [];
  if (b.enabled !== a.enabled) out.push(a.enabled ? "Visitors now see the maintenance page" : "The site is open to visitors again");
  if (b.reopensAt !== a.reopensAt) {
    out.push(a.reopensAt ? `Reopens ${formatReopen(a.reopensAt, "en-GB")}` : "No reopening time - stays closed until switched off");
  }
  if (b.title !== a.title) out.push("Changed the heading");
  if (b.message !== a.message) out.push("Edited the message");
  return out.length ? out : ["Saved with no visible changes"];
}
