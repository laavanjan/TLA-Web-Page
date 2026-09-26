// Admin-managed content for each team's page (/teams/:id), stored one row per
// team in the Supabase `team_pages` table (see supabase/migrations/team_pages.sql).
// A team with no saved row falls back to the content in teamsData.js, so the
// site looks the same until an admin publishes a change.
import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import { TeamsData } from "../Components/teams/teamsData";
import { safeUrl } from "./mediaLinks";

const LS_KEY = "tla_team_pages";

export const SECTION_TYPES = [
  "text",
  "people",
  "timeline",
  "members",
  "youtube",
  "instagram",
  "competitions",
  "gallery",
];

const DEFAULT_TITLES = {
  text: "அணி பற்றி",
  people: "தற்போதைய ஒருங்கிணைப்பாளர்கள்",
  timeline: "முன்னாள் ஒருங்கிணைப்பாளர்கள்",
  members: "அணி உறுப்பினர்கள்",
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
    case "people":
      return { ...base, people: [blankPerson()] };
    case "timeline":
      return { ...base, items: [blankTimelineItem()] };
    case "members":
      return { ...base, names: [] };
    case "competitions":
      return { ...base, items: [blankCompetition()] };
    case "gallery":
      return { ...base, images: [] };
    default:
      return { ...base, links: [] };
  }
}

export const blankPerson = () => ({ id: newId("p"), name: "", role: "", phone: "", photo: "", linkedin: "" });
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
    case "people":
      return {
        ...base,
        people: list(r.people, (p) => {
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
        }),
      };
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
    case "members":
      return { ...base, names: list(r.names, (n) => str(n, 200) || null) };
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
      return { ...base, images: list(r.images, (u) => safeUrl(u) || null) };
    default:
      return { ...base, links: list(r.links, (u) => safeUrl(u) || null) };
  }
}

function defaultPage(team) {
  const sections = [{ ...blankSection("text"), text: str(team.description, 20000) }];
  if (team.coordinators && team.coordinators.length) {
    sections.push({
      ...blankSection("people"),
      people: team.coordinators.map((c) => ({ ...blankPerson(), ...c })),
    });
  }
  if (team.pastCoordinators && team.pastCoordinators.length) {
    sections.push({
      ...blankSection("timeline"),
      items: team.pastCoordinators.map((p) => ({ ...blankTimelineItem(), year: p.year, text: p.name })),
    });
  }
  if (team.members && team.members.length) {
    sections.push({ ...blankSection("members"), names: [...team.members] });
  }
  return {
    title: team.title,
    tagline: team.tagline || "",
    summary: str(team.description, 20000),
    cover: "",
    sections: sections.map(sanitizeSection).filter(Boolean),
  };
}

export function sanitizePage(raw, team) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.sections)) {
    return defaultPage(team);
  }
  return {
    title: str(raw.title, 200) || team.title,
    tagline: str(raw.tagline, 400),
    summary: str(raw.summary, 20000),
    cover: safeUrl(raw.cover),
    sections: raw.sections.map(sanitizeSection).filter(Boolean),
  };
}

// A draft as it will look once published (blank rows dropped, bad links removed).
export function cleanPage(page) {
  const team = TeamsData.find((t) => t.id === page.id);
  return team ? { ...page, ...sanitizePage(page, team) } : page;
}

// rows: { [teamId]: { data, updated_at } }
function buildPages(rows) {
  const r = rows || {};
  return TeamsData.map((team) => {
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
  const team = TeamsData.find((t) => t.id === teamId);
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
