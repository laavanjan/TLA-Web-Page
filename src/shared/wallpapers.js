// Home page wallpapers: rows in the Supabase `homepage_wallpapers` table (see
// supabase/migrations/homepage_wallpapers.sql), images on Cloudinary. Managed
// at /admin/wallpapers, shown as a slideshow behind the home page heading.
//
// Each wallpaper has a heading of its own ("custom"), uses the text shared by
// every wallpaper ("default", from `homepage_wallpaper_settings`), or has no
// heading ("none"). A wallpaper can also change the heading colour and lay a
// colour tint over the picture.
import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import { deleteImages } from "./cloudinaryUpload";

const TABLE = "homepage_wallpapers";
const SETTINGS = "homepage_wallpaper_settings";
const COLUMNS = "id, image_url, public_id, is_visible, sort_order, created_at, text_mode, text, text_color, tint_color, tint_opacity, focus_x, focus_y";
const LS_KEY = "tla_wallpapers_v3";

export const TEXT_MODES = ["default", "custom", "none"];
export const DEFAULT_TEXT_COLOR = "#202020";
export const DEFAULT_TINT_COLOR = "#0b1f3a";
const MAX_TEXT = 300;

export const isColor = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

// Whitelist + validate so a bad row never breaks the home page.
// 0-100, the middle when missing.
const percent = (v) => {
  const n = Number(v);
  return v === null || v === undefined || v === "" || !Number.isFinite(n) ? 50 : Math.min(100, Math.max(0, Math.round(n)));
};

export function normalizeWallpaper(r) {
  const o = r || {};
  const opacity = Number(o.tint_opacity);
  return {
    ...o,
    focus_x: percent(o.focus_x),
    focus_y: percent(o.focus_y),
    text_mode: TEXT_MODES.includes(o.text_mode) ? o.text_mode : "default",
    text: typeof o.text === "string" ? o.text.slice(0, MAX_TEXT) : "",
    text_color: isColor(o.text_color) ? o.text_color : "",
    tint_color: isColor(o.tint_color) ? o.tint_color : "",
    tint_opacity: Number.isFinite(opacity) ? Math.min(100, Math.max(0, Math.round(opacity))) : 0,
  };
}

export const normalizeSettings = (s) => ({
  default_text: s && typeof s.default_text === "string" ? s.default_text.slice(0, MAX_TEXT) : "",
  default_text_color: s && isColor(s.default_text_color) ? s.default_text_color : "",
});

// What the home page draws for one wallpaper.
//   text: null = the built-in verse (with its big first letter), "" = no heading
export function toSlide(row, settings) {
  const w = normalizeWallpaper(row);
  const shared = normalizeSettings(settings);
  let text;
  if (w.text_mode === "none") text = "";
  else if (w.text_mode === "custom") text = w.text.trim();
  else text = shared.default_text.trim() || null;
  return {
    url: w.image_url,
    focus: { x: w.focus_x, y: w.focus_y },
    text,
    color: w.text_color || shared.default_text_color || DEFAULT_TEXT_COLOR,
    tint: w.tint_color && w.tint_opacity > 0 ? { color: w.tint_color, opacity: w.tint_opacity / 100 } : null,
  };
}

function readCache() {
  try {
    const list = JSON.parse(localStorage.getItem(LS_KEY));
    return Array.isArray(list) ? list.filter((s) => s && typeof s.url === "string") : [];
  } catch {
    return [];
  }
}

function writeCache(slides) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(slides));
  } catch {
    /* ignore */
  }
}

// Visitors get only the visible ones (row-level security); main admins get
// everything. Throws when the table can't be read.
export async function fetchWallpapers() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message || "Couldn't read the wallpapers.");
  return (data || []).map(normalizeWallpaper);
}

export async function fetchWallpaperSettings() {
  const { data, error } = await supabase.from(SETTINGS).select("default_text, default_text_color").eq("id", 1).single();
  if (error || !data) throw new Error((error && error.message) || "Couldn't read the shared text.");
  return normalizeSettings(data);
}

export async function saveWallpaperSettings(settings) {
  const clean = normalizeSettings(settings);
  const { data, error } = await supabase.from(SETTINGS).update(clean).eq("id", 1).select("id");
  if (error) throw new Error(error.message || "Could not save.");
  needRow(data);
  return clean;
}

export async function addWallpaper({ url, publicId }, sortOrder) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ image_url: url, public_id: publicId || "", sort_order: sortOrder })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message || "Could not save the wallpaper.");
  return normalizeWallpaper(data);
}

// Row-level security turns "not allowed" into "0 rows", not an error.
function needRow(data) {
  if (!data || !data.length) throw new Error("Nothing was saved - only main admins can change wallpapers.");
}

export async function setWallpaperVisible(id, visible) {
  const { data, error } = await supabase.from(TABLE).update({ is_visible: visible }).eq("id", id).select("id");
  if (error) throw new Error(error.message || "Could not save.");
  needRow(data);
}

// patch: any of text_mode, text, text_color, tint_color, tint_opacity.
export async function updateWallpaper(id, patch) {
  const clean = normalizeWallpaper(patch);
  const body = {};
  ["text_mode", "text", "text_color", "tint_color", "tint_opacity", "focus_x", "focus_y"].forEach((k) => {
    if (k in patch) body[k] = clean[k];
  });
  const { data, error } = await supabase.from(TABLE).update(body).eq("id", id).select("id");
  if (error) throw new Error(error.message || "Could not save.");
  needRow(data);
  return body;
}

// Removes the row, then the picture on Cloudinary (best effort).
export async function removeWallpaper(row) {
  const { data, error } = await supabase.from(TABLE).delete().eq("id", row.id).select("id");
  if (error) throw new Error(error.message || "Could not delete.");
  needRow(data);
  if (row.public_id) await deleteImages([row.public_id]);
}

// `rows` is the new order; numbers them 0..n-1, saving only what changed.
export async function saveOrder(rows) {
  const results = await Promise.all(
    rows.map((r, i) => (r.sort_order === i ? null : supabase.from(TABLE).update({ sort_order: i }).eq("id", r.id)))
  );
  const failed = results.find((r) => r && r.error);
  if (failed) throw new Error(failed.error.message || "Could not save the order.");
}

// The visible slides, in order, for the home page. Starts from the last
// answer so a returning visitor sees the slideshow on first paint, then asks
// the database. Fails quietly: no wallpapers means the plain hero.
export function useHomeWallpapers() {
  const [slides, setSlides] = useState(readCache);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchWallpapers(), fetchWallpaperSettings().catch(() => null)])
      .then(([rows, settings]) => {
        const list = rows.filter((r) => r.is_visible).map((r) => toSlide(r, settings));
        writeCache(list);
        if (alive) setSlides(list);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return slides;
}
