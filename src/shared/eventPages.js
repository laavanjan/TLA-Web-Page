// Admin-managed content for the event pages (/events/…), one row per event in
// the Supabase `event_pages` table (see supabase/migrations/event_pages.sql).
// An event with no saved row shows the content built into the site
// (Components/events/eventsRegistry.js), so nothing changes until an admin
// publishes. Events made in the admin have a row and no built-in content.
//
// One extra row, `__layout`, holds which events the home page lists, in what
// order. Only main admins can write it.
import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import { BUILTIN_EVENTS, builtInPage, isBuiltIn, eventPath } from "../Components/events/eventsRegistry";
import { sanitizeEventPage, EVENT_CATEGORIES, SLUG_RE } from "./eventSections";
import { uploadedImage } from "./mediaLinks";

const LS_KEY = "tla_event_pages";

export const LAYOUT_ID = "__layout";

// ---- Layout (home page order) ---------------------------------------------------

const validId = (x) => typeof x === "string" && (isBuiltIn(x) || SLUG_RE.test(x));
const idList = (a) => [...new Set((Array.isArray(a) ? a : []).filter(validId))];

// { order: [ids], hidden: [ids] | null }. `hidden: null` means the layout was
// never saved, so each event's own default applies (the food festival has
// never been on the home page).
export function sanitizeLayout(raw) {
  return {
    order: idList(raw && raw.order),
    hidden: raw && Array.isArray(raw.hidden) ? idList(raw.hidden) : null,
  };
}

export const defaultHidden = () => BUILTIN_EVENTS.filter((e) => e.hiddenOnHome).map((e) => e.id);
export const hiddenIds = (layout) => (layout.hidden === null ? defaultHidden() : layout.hidden);

// ---- Building the pages --------------------------------------------------------------

// rows: { [id]: { data, updated_at } }  ->  { pages, layout, layoutUpdatedAt }
function snapshot(rows) {
  const r = rows || {};
  const pages = BUILTIN_EVENTS.map((e) => {
    const row = r[e.id];
    return {
      id: e.id,
      builtIn: true,
      parent: e.parent || null,
      path: e.path,
      updatedAt: row ? row.updated_at : null,
      ...sanitizeEventPage(row && row.data, builtInPage(e.id)),
    };
  });
  Object.keys(r)
    .filter((id) => id !== LAYOUT_ID && !isBuiltIn(id) && SLUG_RE.test(id) && r[id] && r[id].data)
    .sort()
    .forEach((id) => {
      pages.push({
        id,
        builtIn: false,
        parent: null,
        path: eventPath(id),
        updatedAt: r[id].updated_at,
        ...sanitizeEventPage(r[id].data, null),
      });
    });
  const layoutRow = r[LAYOUT_ID];
  return {
    pages,
    layout: sanitizeLayout(layoutRow && layoutRow.data),
    layoutUpdatedAt: layoutRow ? layoutRow.updated_at : null,
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

function writeLocal(rows) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export const getCachedEventPages = () => snapshot(readLocal());

export async function fetchEventPages() {
  const { data, error } = await supabase.from("event_pages").select("id, data, updated_at");
  if (error || !Array.isArray(data)) return getCachedEventPages();
  const rows = {};
  data.forEach((row) => {
    rows[row.id] = { data: row.data, updated_at: row.updated_at };
  });
  writeLocal(rows);
  return snapshot(rows);
}

// Publishes one event's page - live for every visitor. RLS only allows main
// admins, or editors assigned to the event, to write.
export async function saveEventPage(id, page) {
  const builtIn = builtInPage(id);
  if (!builtIn && !SLUG_RE.test(id)) throw new Error("That isn't a valid event address.");
  const clean = sanitizeEventPage({ ...page, sections: page.sections || [] }, builtIn);
  const updated_at = new Date().toISOString();
  const { error } = await supabase.from("event_pages").upsert({ id, data: clean, updated_at });
  if (error) throw new Error(error.message || "Could not save.");

  const rows = readLocal() || {};
  rows[id] = { data: clean, updated_at };
  writeLocal(rows);
  return snapshot(rows).pages.find((p) => p.id === id);
}

// Built-in events go back to their built-in content; events made in the admin
// are deleted. Main admins only.
export async function removeEventPage(id) {
  const { data, error } = await supabase.from("event_pages").delete().eq("id", id).select("id");
  if (error) throw new Error(error.message || "Could not remove it.");
  // Row-level security turns "not allowed" into "0 rows", not an error.
  if (!data || !data.length) throw new Error("Nothing was removed - only main admins can do this.");
  const rows = readLocal() || {};
  delete rows[id];
  writeLocal(rows);
  return snapshot(rows);
}

export async function saveLayout(layout) {
  const clean = { order: idList(layout.order), hidden: idList(layout.hidden === null ? defaultHidden() : layout.hidden) };
  const updated_at = new Date().toISOString();
  const { error } = await supabase.from("event_pages").upsert({ id: LAYOUT_ID, data: clean, updated_at });
  if (error) throw new Error(error.message || "Could not save.");
  const rows = readLocal() || {};
  rows[LAYOUT_ID] = { data: clean, updated_at };
  writeLocal(rows);
  return snapshot(rows);
}

// A draft as it will look once published (blank rows dropped, bad links removed).
export const cleanEventPage = (page) => ({ ...page, ...sanitizeEventPage(page, builtInPage(page.id)) });

// { pages, layout, loaded }: what was saved on this device first, then what the
// database says. `loaded` is false until that first answer, so a page for an
// event made in the admin can wait instead of flashing "not found".
export function useEventPages() {
  const [state, setState] = useState(() => ({ ...getCachedEventPages(), loaded: false }));
  useEffect(() => {
    let alive = true;
    fetchEventPages()
      .then((s) => alive && setState({ ...s, loaded: true }))
      .catch(() => alive && setState((cur) => ({ ...cur, loaded: true })));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

// ---- Home page ----------------------------------------------------------------------------

// Every event that can have a card (sub-pages can't), by category, in the
// admin's order - hidden ones included. Events the admin hasn't placed yet
// follow the placed ones in their built-in order.
export function groupsWithHidden(pages, layout) {
  const rank = new Map(layout.order.map((id, i) => [id, i]));
  const base = new Map(pages.map((p, i) => [p.id, i]));
  const by = (a, b) => {
    const ra = rank.has(a.id) ? rank.get(a.id) : Infinity;
    const rb = rank.has(b.id) ? rank.get(b.id) : Infinity;
    return ra - rb || base.get(a.id) - base.get(b.id);
  };
  return EVENT_CATEGORIES.map((category) => ({
    category,
    cards: pages.filter((p) => !p.parent && p.category === category.id).sort(by),
  }));
}

// The cards for the home page: [{ category, cards: [page] }], hidden events
// left out, and categories with no cards left out too.
export function homeGroups(pages, layout) {
  const hidden = new Set(hiddenIds(layout));
  return groupsWithHidden(pages, layout)
    .map((g) => ({ ...g, cards: g.cards.filter((p) => !hidden.has(p.id)) }))
    .filter((g) => g.cards.length);
}

// ---- Images ----------------------------------------------------------------------------------

// Every image URL a page uses, in all its sections.
function imageUrls(page) {
  const urls = [page.image];
  (page.sections || []).forEach((s) => {
    const imgs = (list) => (list || []).forEach((i) => urls.push(i.url));
    switch (s.type) {
      case "intro":
        urls.push(s.image);
        break;
      case "agenda":
      case "gallery":
        imgs(s.images);
        break;
      case "awards":
        s.items.forEach((a) => urls.push(a.image));
        break;
      case "sponsors":
        s.items.forEach((x) => urls.push(x.logo));
        break;
      case "competitions":
        s.items.forEach((c) => urls.push(c.poster));
        break;
      case "cards":
        s.items.forEach((c) => {
          urls.push(c.image);
          imgs(c.images);
        });
        break;
      case "editions":
        s.items.forEach((e) => imgs(e.images));
        break;
      default:
    }
  });
  return urls;
}

// Cloudinary public ids of every image uploaded for this event that the page
// still uses. Comparing this before and after a publish says which files to
// delete. Only ids under this event's own folder count, so removing a photo
// here can never delete a file another page points at.
export function eventPublicIds(page) {
  const ids = new Set();
  if (!page) return ids;
  imageUrls(page).forEach((u) => {
    const hit = uploadedImage(u);
    if (hit && hit.eventId === page.id) ids.add(hit.publicId);
  });
  return ids;
}

export const eventTitle = (pages, id) => (pages.find((p) => p.id === id) || {}).title || id;
