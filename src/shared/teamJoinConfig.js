// "Join our teams" settings, backed by a single row in the Supabase
// `team_join_config` table (see supabase/migrations/team_join.sql). Edited at
// /admin/team-join, read by the public Teams page and join form.
//
// "name" is always collected and isn't part of `fields` — everything else
// (faculty, batch, district, team, and any custom field the admin adds) is a
// fully admin-managed entry in `fields`, so admins can rename, retype, add or
// remove fields — including the team/district/batch option lists — without a
// code change.
import { supabase } from "../helpers/supabaseClient";
import { FACULTY_OPTIONS } from "../Components/book/submit-form/formOptions";
import { TeamsData } from "../Components/teams/teamsData";

const LS_KEY = "tla_team_join_config";
const CONFIG_ROW_ID = 1;

export const FIELD_TYPES = ["text", "select", "textarea"];

export const DISTRICT_OPTIONS = [
  "யாழ்ப்பாணம்", "கிளிநொச்சி", "மன்னார்", "வவுனியா", "முல்லைத்தீவு",
  "மட்டக்களப்பு", "அம்பாறை", "திருகோணமலை", "குருணாகல்", "புத்தளம்",
  "அனுராதபுரம்", "பொலன்னறுவை", "பதுளை", "மொனராகலை", "இரத்தினபுரி",
  "கேகாலை", "கொழும்பு", "கம்பஹா", "களுத்துறை", "காலி",
  "மாத்தறை", "ஹம்பாந்தோட்டை", "கண்டி", "மாத்தளை", "நுவரெலியா",
];

export const DEFAULT_TEAM_JOIN_CONFIG = {
  enabled: true,
  fields: [
    { key: "faculty", label: "பீடம் (Faculty)", type: "select", required: true, options: [...FACULTY_OPTIONS] },
    { key: "batch", label: "கல்வியாண்டு (Batch)", type: "select", required: true, options: ["22", "23", "24", "25", "26"] },
    { key: "district", label: "மாவட்டம் (District)", type: "select", required: true, options: [...DISTRICT_OPTIONS] },
    { key: "team", label: "விரும்பும் அணி (Team)", type: "select", required: true, options: TeamsData.map((t) => t.title) },
    { key: "detail", label: "கூடுதல் தகவல்", type: "textarea", required: false, options: [] },
  ],
  // Team name -> WhatsApp group link, shown after a successful application.
  teamLinks: {},
};

let autoKeySeq = 0;
function newFieldKey() {
  autoKeySeq += 1;
  return `field_${Date.now().toString(36)}_${autoKeySeq}`;
}

function sanitizeField(f) {
  const raw = f || {};
  return {
    key: String(raw.key || "").trim() || newFieldKey(),
    label: String(raw.label || "").trim() || "புலம்",
    type: FIELD_TYPES.includes(raw.type) ? raw.type : "text",
    required: !!raw.required,
    options: Array.isArray(raw.options)
      ? raw.options.map((o) => String(o).trim()).filter(Boolean)
      : [],
  };
}

function mergeFields(partial) {
  const arr = Array.isArray(partial) ? partial : null;
  if (!arr || !arr.length) {
    return DEFAULT_TEAM_JOIN_CONFIG.fields.map(sanitizeField);
  }
  return arr.map(sanitizeField);
}

function mergeTeamLinks(partial) {
  if (!partial || typeof partial !== "object") return {};
  const out = {};
  Object.keys(partial).forEach((team) => {
    if (typeof partial[team] === "string" && partial[team].trim()) {
      out[team] = partial[team].trim();
    }
  });
  return out;
}

// Whitelist + validate known keys so an unexpected response never pollutes or
// breaks the config.
export function mergeConfig(partial) {
  const p = partial || {};
  const d = DEFAULT_TEAM_JOIN_CONFIG;
  return {
    enabled: typeof p.enabled === "boolean" ? p.enabled : d.enabled,
    fields: mergeFields(p.fields),
    teamLinks: mergeTeamLinks(p.teamLinks),
  };
}

export function blankField() {
  return { key: newFieldKey(), label: "புதிய புலம்", type: "text", required: false, options: [] };
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
export function getCachedTeamJoinConfig() {
  return mergeConfig(readLocal());
}

export async function fetchTeamJoinConfig() {
  const { data, error } = await supabase
    .from("team_join_config")
    .select("data")
    .eq("id", CONFIG_ROW_ID)
    .single();

  if (error || !data) {
    return getCachedTeamJoinConfig();
  }

  const merged = mergeConfig(data.data);
  writeLocal(merged);
  return merged;
}

// Publishes config to Supabase — live for every visitor. Requires a signed-in
// admin session (RLS only allows authenticated writes; see the migration).
export async function saveTeamJoinConfig(cfg) {
  const merged = mergeConfig(cfg);
  const { error } = await supabase
    .from("team_join_config")
    .update({ data: merged, updated_at: new Date().toISOString() })
    .eq("id", CONFIG_ROW_ID);

  if (error) {
    throw new Error(error.message || "Could not save.");
  }

  writeLocal(merged);
  return { synced: true };
}
