// Admin-managed content for each team's page (/teams/:id), stored one row per
// team in the Supabase `team_pages` table (see supabase/migrations/team_pages.sql).
// A team with no saved row falls back to the content in teamsData.js, so the
// site looks the same until an admin publishes a change.
import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import { TeamsData } from "../Components/teams/teamsData";
import { safeUrl, safeSocialUrl, uploadedImage } from "./mediaLinks";
import { deleteImages } from "./cloudinaryUpload";

const LS_KEY = "tla_team_pages";

export const SECTION_TYPES = [
  "text",
  "years",
  "timeline",
  "youtube",
  "instagram",
  "competitions",
  "gallery",
];

const DEFAULT_TITLES = {
  text: "அணி பற்றி",
  years: "எமது அணி",
  timeline: "எமது பயணம்",
  youtube: "காணொளிகள்",
  instagram: "Instagram பதிவுகள்",
  competitions: "எமது போட்டிகள்",
  gallery: "புகைப்படங்கள்",
};

let seq = 0;
export function newId(prefix = "s") {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq}`;
}

export function blankSection(type) {
  const base = { id: newId(), type, title: DEFAULT_TITLES[type] || "", hidden: false };
  switch (type) {
    case "text":
      return { ...base, text: "", buttonLabel: "", buttonUrl: "" };
    case "years":
      return { ...base, years: [blankYear()] };
    case "timeline":
      return { ...base, items: [blankTimelineItem()] };
    case "competitions":
      return { ...base, items: [blankCompetition()] };
    case "gallery":
      return { ...base, images: [] };
    default:
      return { ...base, links: [] };
  }
}

export const blankPerson = () => ({ id: newId("p"), name: "", role: "", phone: "", photo: "", linkedin: "" });
export const thisYear = () => String(new Date().getFullYear());
export const blankYear = (year = thisYear()) => ({ id: newId("y"), year, people: [blankPerson()], members: [] });
export const blankTimelineItem = () => ({ id: newId("t"), year: "", text: "" });
export const blankCompetition = () => ({
  id: newId("c"),
  name: "",
  date: "",
  venue: "",
  poster: "",
  description: "",
  registerUrl: "",
  recordingUrl: "",
  winners: ["", "", ""],
});

const str = (v, max = 5000) => String(v == null ? "" : v).slice(0, max).trim();
const list = (arr, fn) => (Array.isArray(arr) ? arr.map(fn).filter(Boolean) : []);
const dim = (v) => {
  const n = Math.round(Number(v));
  return n > 0 && n <= 20000 ? n : 0;
};

export const blankImage = (url = "") => ({ id: newId("g"), url, caption: "", width: 0, height: 0 });

function sanitizePerson(p) {
  const name = str(p && p.name, 200);
  if (!name) return null;
  return {
    id: str(p.id, 80) || newId("p"),
    name,
    role: str(p.role, 200),
    phone: str(p.phone, 40),
    photo: safeUrl(p.photo),
    linkedin: safeUrl(p.linkedin),
  };
}

// Newest year first; anything that isn't a plain year number goes last.
export function sortYears(years) {
  const n = (y) => (/^\d{4}$/.test(y.year) ? Number(y.year) : -1);
  return [...years].sort((a, b) => n(b) - n(a));
}

function sanitizeYear(y) {
  const year = str(y && y.year, 20);
  if (!year) return null;
  return {
    id: str(y.id, 80) || newId("y"),
    year,
    people: list(y.people, sanitizePerson),
    members: list(y.members, (m) => str(m, 200) || null),
  };
}

// ---- Older pages: one "Team by year" section instead of three ------------
// Pages used to keep current coordinators ("people"), current members
// ("members") and past coordinators (a "timeline" with this title) in
// separate sections. They're folded into a single "years" section when a page
// loads; nothing changes on the live site until it's published.
const LEGACY_PAST_TITLE = "முன்னாள் ஒருங்கிணைப்பாளர்கள்";

const isLegacyTeamSection = (s) =>
  !!s &&
  (s.type === "people" || s.type === "members" || (s.type === "timeline" && str(s.title) === LEGACY_PAST_TITLE));

export function upgradeSections(sections) {
  if (!Array.isArray(sections) || !sections.some(isLegacyTeamSection)) return sections;
  const current = thisYear();
  const byYear = new Map();
  const yearOf = (label) => {
    if (!byYear.has(label)) byYear.set(label, { id: `y_${label}`, year: label, people: [], members: [] });
    return byYear.get(label);
  };
  let at = -1;
  let allHidden = true;
  sections.forEach((s, i) => {
    if (!isLegacyTeamSection(s)) return;
    if (at < 0) at = i;
    if (!s.hidden) allHidden = false;
    if (s.type === "people") yearOf(current).people.push(...(s.people || []));
    if (s.type === "members") yearOf(current).members.push(...(s.names || []));
    if (s.type === "timeline") {
      (s.items || []).forEach((t) => {
        const name = str(t && t.text, 200);
        if (!name) return;
        const m = str(t.year, 40).match(/\d{4}/);
        const y = yearOf(m ? m[0] : str(t.year, 20) || current);
        if (!y.people.some((p) => p.name === name)) y.people.push({ id: `p_${t.id || name}`, name, role: "" });
      });
    }
  });
  const merged = {
    id: "years_legacy",
    type: "years",
    title: DEFAULT_TITLES.years,
    hidden: allHidden,
    years: sortYears([...byYear.values()]),
  };
  const rest = sections.filter((s) => !isLegacyTeamSection(s));
  rest.splice(at, 0, merged); // where the first of the old sections was
  return rest;
}

// Gallery photos are { id, url, caption, width, height }. Galleries saved
// before uploads existed hold plain URL strings; those still load.
function sanitizeImage(raw) {
  const r = typeof raw === "string" ? { url: raw } : raw || {};
  const url = safeUrl(r.url);
  if (!url) return null;
  return {
    id: str(r.id, 80) || newId("g"),
    url,
    caption: str(r.caption, 300),
    width: dim(r.width),
    height: dim(r.height),
  };
}

function sanitizeSection(raw) {
  const r = raw || {};
  if (!SECTION_TYPES.includes(r.type)) return null;
  const base = {
    id: str(r.id, 80) || newId(),
    type: r.type,
    title: str(r.title, 200),
    hidden: !!r.hidden,
  };
  switch (r.type) {
    case "text":
      return {
        ...base,
        text: str(r.text, 20000),
        buttonLabel: str(r.buttonLabel, 80),
        buttonUrl: safeUrl(r.buttonUrl),
      };
    case "years":
      return { ...base, years: sortYears(list(r.years, sanitizeYear)) };
    case "timeline":
      return {
        ...base,
        items: list(r.items, (t) => {
          const year = str(t && t.year, 40);
          const text = str(t && t.text, 500);
          if (!year && !text) return null;
          return { id: str(t.id, 80) || newId("t"), year, text };
        }),
      };
    case "competitions":
      return {
        ...base,
        items: list(r.items, (c) => {
          const name = str(c && c.name, 300);
          if (!name) return null;
          const date = str(c.date, 10);
          const winners = Array.isArray(c.winners) ? c.winners : [];
          return {
            id: str(c.id, 80) || newId("c"),
            name,
            date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
            venue: str(c.venue, 300),
            poster: safeUrl(c.poster),
            description: str(c.description, 5000),
            registerUrl: safeUrl(c.registerUrl),
            recordingUrl: safeUrl(c.recordingUrl),
            winners: [0, 1, 2].map((i) => str(winners[i], 200)),
          };
        }),
      };
    case "gallery":
      return { ...base, images: list(r.images, sanitizeImage) };
    default:
      return { ...base, links: list(r.links, (u) => safeUrl(u) || null) };
  }
}

function defaultPage(team) {
  // Built in the old three-section shape and upgraded like a saved page, so
  // built-in content and converted pages end up the same.
  const sections = [{ ...blankSection("text"), text: str(team.description, 20000) }];
  if (team.coordinators && team.coordinators.length) {
    sections.push({
      id: "people_default",
      type: "people",
      people: team.coordinators.map((c, i) => ({ ...c, id: `p_default_${i}` })),
    });
  }
  if (team.pastCoordinators && team.pastCoordinators.length) {
    sections.push({
      id: "timeline_default",
      type: "timeline",
      title: LEGACY_PAST_TITLE,
      items: team.pastCoordinators.map((p, i) => ({ id: `t_default_${i}`, year: p.year, text: p.name })),
    });
  }
  if (team.members && team.members.length) {
    sections.push({ id: "members_default", type: "members", names: [...team.members] });
  }
  return {
    title: team.title,
    tagline: team.tagline || "",
    summary: str(team.description, 20000),
    cover: "",
    logo: "",
    banner: "",
    socials: [],
    sections: upgradeSections(sections).map(sanitizeSection).filter(Boolean),
  };
}

// Teams made in /admin/teams have no entry in teamsData.js: their title lives
// in the saved page itself, and ids start here.
export const CUSTOM_TEAM_FIRST_ID = 101;
export const MAX_TEAM_ID = 999;

// The built-in team with this id, or - for a team an admin made - a stand-in
// built from its saved page.
const teamBase = (id, data) => {
  const built = TeamsData.find((t) => t.id === id);
  if (built) return built;
  if (data && typeof data === "object" && data.custom === true) {
    return { id, title: str(data.title, 200) || "புதிய அணி", custom: true };
  }
  return null;
};

export function sanitizePage(raw, team) {
  // hidden: an admin switched the whole page off for visitors (/admin/teams).
  const hidden = !!raw && typeof raw === "object" && raw.hidden === true;
  // custom: made in /admin/teams rather than built in; only those can be deleted.
  const custom = !!raw && typeof raw === "object" && raw.custom === true;
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.sections)) {
    return { ...defaultPage(team), hidden, custom };
  }
  return {
    hidden,
    custom,
    title: str(raw.title, 200) || team.title,
    tagline: str(raw.tagline, 400),
    summary: str(raw.summary, 20000),
    cover: safeUrl(raw.cover),
    logo: safeUrl(raw.logo),
    banner: safeUrl(raw.banner),
    socials: [...new Set(list(raw.socials, (u) => safeSocialUrl(u) || null))],
    sections: upgradeSections(raw.sections).map(sanitizeSection).filter(Boolean),
  };
}

// A draft as it will look once published (blank rows dropped, bad links removed).
export function cleanPage(page) {
  const team = teamBase(page.id, page);
  return team ? { ...page, ...sanitizePage(page, team) } : page;
}

// rows: { [teamId]: { data, updated_at } }
function buildPages(rows) {
  const r = rows || {};
  const teams = [...TeamsData];
  Object.keys(r)
    .map(Number)
    .filter((id) => !TeamsData.some((t) => t.id === id))
    .sort((a, b) => a - b)
    .forEach((id) => {
      const base = teamBase(id, r[id] && r[id].data);
      if (base) teams.push(base);
    });
  return teams.map((team) => {
    const row = r[team.id];
    return {
      id: team.id,
      updatedAt: row ? row.updated_at : null,
      fallbackPhoto: team.photo,
      ...sanitizePage(row && row.data, team),
    };
  });
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

export function getCachedTeamPages() {
  return buildPages(readLocal());
}

export async function fetchTeamPages() {
  const { data, error } = await supabase.from("team_pages").select("id, data, updated_at");
  if (error || !Array.isArray(data)) return getCachedTeamPages();
  const rows = {};
  data.forEach((row) => {
    rows[row.id] = { data: row.data, updated_at: row.updated_at };
  });
  writeLocal(rows);
  return buildPages(rows);
}

// Publishes one team's page — live for every visitor. RLS only allows
// signed-in admins to write.
export async function saveTeamPage(teamId, page) {
  const team = teamBase(teamId, page);
  if (!team) throw new Error("Unknown team.");
  const clean = sanitizePage({ ...page, sections: page.sections || [] }, team);
  const updated_at = new Date().toISOString();
  const { error } = await supabase
    .from("team_pages")
    .upsert({ id: teamId, data: clean, updated_at });
  if (error) throw new Error(error.message || "Could not save.");

  const rows = readLocal() || {};
  rows[teamId] = { data: clean, updated_at };
  writeLocal(rows);
  return { id: teamId, updatedAt: updated_at, fallbackPhoto: team.photo, ...clean };
}

// Hides a team's page from visitors, or shows it again. The content is left
// alone. Main admins only - the database ignores it from anyone else (see
// supabase/migrations/team_hidden.sql).
export async function setTeamHidden(teamId, hidden) {
  const { data: row, error: readErr } = await supabase
    .from("team_pages")
    .select("data, updated_at")
    .eq("id", teamId)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message || "Could not read the page.");

  if (!row && !TeamsData.some((t) => t.id === teamId)) throw new Error("Unknown team.");
  const base = row && row.data && typeof row.data === "object" ? row.data : {};
  const data = { ...base, hidden: !!hidden };
  const query = supabase.from("team_pages");
  const { data: done, error } = row
    ? await query.update({ data }).eq("id", teamId).select("id")
    : await query.insert({ id: teamId, data, updated_at: new Date().toISOString() }).select("id");
  if (error) throw new Error(error.message || "Could not save.");
  if (!done || !done.length) throw new Error("Nothing was saved - only main admins can hide a team.");

  const rows = readLocal() || {};
  rows[teamId] = { data, updated_at: row ? row.updated_at : new Date().toISOString() };
  writeLocal(rows);
  return !!hidden;
}

// Makes a new, empty team page (main admins only). It starts hidden, so it can
// be built before visitors see it. Returns the page, like fetchTeamPages does.
export async function createTeamPage(title) {
  const name = str(title, 200);
  if (!name) throw new Error("Give the team a name.");
  const { data: ids, error: idErr } = await supabase.from("team_pages").select("id");
  if (idErr) throw new Error(idErr.message || "Could not read the teams.");
  let id = Math.max(CUSTOM_TEAM_FIRST_ID - 1, ...(ids || []).map((x) => x.id)) + 1;

  const data = { title: name, tagline: "", summary: "", sections: [], hidden: true, custom: true };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (id > MAX_TEAM_ID) throw new Error("No more team ids are free.");
    const updated_at = new Date().toISOString();
    const { error } = await supabase.from("team_pages").insert({ id, data, updated_at });
    if (!error) {
      const rows = readLocal() || {};
      rows[id] = { data, updated_at };
      writeLocal(rows);
      const team = teamBase(id, data);
      return { id, updatedAt: updated_at, fallbackPhoto: undefined, ...sanitizePage(data, team) };
    }
    if (error.code !== "23505") throw new Error(error.message || "Could not create the team.");
    id += 1; // someone else took that number a moment ago
  }
  throw new Error("Could not create the team - try again.");
}

// Deletes a team made in /admin/teams, with its page and the images it
// uploaded. The built-in teams can only be hidden. Main admins only.
export async function deleteTeamPage(page) {
  if (!page || !page.custom) throw new Error("Only teams you created can be deleted. Hide this one instead.");
  const { data, error } = await supabase.from("team_pages").delete().eq("id", page.id).select("id");
  if (error) throw new Error(error.message || "Could not delete.");
  if (!data || !data.length) throw new Error("Nothing was deleted - only main admins can delete a team.");

  const rows = readLocal() || {};
  delete rows[page.id];
  writeLocal(rows);
  const ids = [...pagePublicIds(page)];
  if (ids.length) await deleteImages(ids); // best effort
}

// Cloudinary public ids of every image this team uploaded that the page still
// uses — logo, banner, cover, people photos, posters and gallery photos.
// Comparing this before/after a publish tells us which files to delete.
// Only ids under this team's own folder count, so removing a photo here can
// never delete a file another team's page points at.
export function pagePublicIds(page) {
  if (!page) return new Set();
  const urls = [page.logo, page.banner, page.cover];
  (page.sections || []).forEach((s) => {
    if (s.type === "years") s.years.forEach((y) => y.people.forEach((p) => urls.push(p.photo)));
    if (s.type === "competitions") s.items.forEach((c) => urls.push(c.poster));
    if (s.type === "gallery") s.images.forEach((img) => urls.push(img.url));
  });
  const ids = new Set();
  urls.forEach((u) => {
    const hit = uploadedImage(u);
    if (hit && hit.teamId === page.id) ids.add(hit.publicId);
  });
  return ids;
}

export const missingFrom = (a, b) => [...a].filter((x) => !b.has(x));

export function useTeamPages() {
  const [pages, setPages] = useState(getCachedTeamPages);
  useEffect(() => {
    let alive = true;
    fetchTeamPages()
      .then((p) => alive && setPages(p))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return pages;
}

// ---- Competitions ---------------------------------------------------------

export function todayKey() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysUntil(date) {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  const [ty, tm, td] = todayKey().split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
}

// "upcoming" | "today" | "completed" | "tba"
export function competitionStatus(c) {
  const n = daysUntil(c.date);
  if (n === null) return "tba";
  if (n > 0) return "upcoming";
  if (n === 0) return "today";
  return "completed";
}

// Every visible upcoming competition across all teams, soonest first.
export function upcomingCompetitions(pages) {
  const out = [];
  pages.forEach((page) =>
    !page.hidden &&
    page.sections
      .filter((s) => s.type === "competitions" && !s.hidden)
      .forEach((s) =>
        s.items.forEach((c) => {
          const status = competitionStatus(c);
          if (status === "upcoming" || status === "today") {
            out.push({ ...c, status, teamId: page.id, teamTitle: page.title });
          }
        })
      )
  );
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
