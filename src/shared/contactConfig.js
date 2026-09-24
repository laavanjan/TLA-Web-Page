// Contact/social-link settings, backed by a single row in the Supabase
// `contact_info` table (see supabase/migrations/contact_info.sql). Edited at
// /admin/contact, read by the public Contact section.
import { supabase } from "../helpers/supabaseClient";

const LS_KEY = "tla_contact_config";
const CONFIG_ROW_ID = 1;

export const DEFAULT_CONTACT_CONFIG = {
  email: "thamizhiyam@gmail.com",
  phoneName: "அபினேஷ்",
  phoneNumber: "076 843 2752",
  facebookUrl: "https://web.facebook.com/TLAuom",
  youtubeUrl: "https://www.youtube.com/@TLAUOM",
  instagramUrl: "https://www.instagram.com/tla_uom/",
};

// Whitelist + validate known keys so an unexpected response never pollutes or
// breaks the config.
export function mergeConfig(partial) {
  const p = partial || {};
  const d = DEFAULT_CONTACT_CONFIG;
  const str = (v, fallback) => (typeof v === "string" && v.trim() ? v.trim() : fallback);
  return {
    email: str(p.email, d.email),
    phoneName: str(p.phoneName, d.phoneName),
    phoneNumber: str(p.phoneNumber, d.phoneNumber),
    facebookUrl: str(p.facebookUrl, d.facebookUrl),
    youtubeUrl: str(p.youtubeUrl, d.youtubeUrl),
    instagramUrl: str(p.instagramUrl, d.instagramUrl),
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
// so pages render instantly without a flash while the fetch runs.
export function getCachedContactConfig() {
  return mergeConfig(readLocal());
}

export async function fetchContactConfig() {
  const { data, error } = await supabase
    .from("contact_info")
    .select("data")
    .eq("id", CONFIG_ROW_ID)
    .single();

  if (error || !data) {
    return getCachedContactConfig();
  }

  const merged = mergeConfig(data.data);
  writeLocal(merged);
  return merged;
}

// Publishes config to Supabase — live for every visitor. Requires a signed-in
// admin session (RLS only allows authenticated writes; see the migration).
export async function saveContactConfig(cfg) {
  const merged = mergeConfig(cfg);
  const { error } = await supabase
    .from("contact_info")
    .update({ data: merged, updated_at: new Date().toISOString() })
    .eq("id", CONFIG_ROW_ID);

  if (error) {
    throw new Error(error.message || "Could not save.");
  }

  writeLocal(merged);
  return { synced: true };
}
