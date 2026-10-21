// Every public page the site has, with its title, description and share
// picture: the fixed pages from src/seo/pages.json, plus books, events made in
// the admin and team pages read from Supabase. Used at build time by
// scripts/seo-build.js for the sitemap and the ready-made page heads.
const path = require("path");
const { pages: STATIC } = require(path.join(__dirname, "../../src/seo/pages.json"));

const TIMEOUT = 10000;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;

const str = (v) => (typeof v === "string" ? v.trim() : "");

// GET a Supabase table through its REST API with the public (anon) key: the
// same rows any visitor can read. Resolves to [] on any failure, so a build
// never breaks because Supabase is slow or a table doesn't exist yet.
async function readTable(env, table, select) {
  const url = env.REACT_APP_SUPABASE_URL;
  const key = env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/${table}?select=${encodeURIComponent(select)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.warn(`seo: couldn't read ${table} (${err.message}); continuing without it.`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// The picture a book shows on its card (src/book/books.js coverPair): the
// uploaded cover, else the PDF's first page.
function bookImage(b) {
  if (str(b.cover_url)) return str(b.cover_url);
  if (b.source === "upload" && str(b.pdf_url)) {
    return str(b.pdf_url)
      .replace("/upload/", "/upload/pg_1,w_1200,c_limit,q_auto,f_jpg/")
      .replace(/\.pdf$/i, ".jpg");
  }
  if (b.source !== "upload" && str(b.drive_file_id)) return `https://drive.google.com/thumbnail?id=${b.drive_file_id}&sz=w1200`;
  return "";
}

// Built-in event ids → their address, the way eventsRegistry.js lays them out.
function eventPathOf(id) {
  if (id === "ideathon") return "/ideathon";
  const sub = id.match(/^brammam-(.+)$/);
  if (sub && STATIC[`/events/brammam/${sub[1]}`]) return `/events/brammam/${sub[1]}`;
  return `/events/${id}`;
}

// { [path]: { title, description, image, type, lang, noindex, lastmod } }
function buildRoutes({ books = [], events = [], teams = [] } = {}) {
  const routes = {};
  Object.entries(STATIC).forEach(([p, meta]) => {
    routes[p] = { ...meta };
  });

  events.forEach((row) => {
    if (!row || row.id === "__layout" || !SLUG_RE.test(row.id || "")) return;
    const d = row.data || {};
    const p = eventPathOf(row.id);
    const base = routes[p] || { image: "/og/home.jpg", type: "article" };
    const image = /^https?:\/\//.test(str(d.image)) ? str(d.image) : base.image;
    routes[p] = {
      ...base,
      title: str(d.title) || base.title || row.id,
      description: str(d.summary) || base.description || "",
      image,
      lastmod: row.updated_at,
    };
  });

  teams.forEach((row) => {
    const p = `/teams/${row.id}`;
    const d = row.data || {};
    if (d.hidden === true) {
      delete routes[p];
      return;
    }
    const base = routes[p] || {};
    const title = str(d.title) || base.title;
    if (!title) return;
    const tagline = str(d.tagline);
    routes[p] = {
      ...base,
      title,
      description: tagline ? `${title} — ${tagline}. தமிழ் இலக்கிய மன்றம், மொறட்டுவைப் பல்கலைக்கழகம்.` : base.description || "",
      image: /^https?:\/\//.test(str(d.logo)) ? str(d.logo) : base.image,
      lastmod: row.updated_at,
    };
  });

  books.forEach((b) => {
    if (!SLUG_RE.test(b.slug || "") || b.visibility === "hidden") return;
    routes[`/books/${b.slug}`] = {
      title: `${str(b.title)} - நூல்`,
      description: str(b.description) || `தமிழ் இலக்கிய மன்றம் — ${str(b.title)} நூல்.`,
      image: bookImage(b),
      type: "book",
      // Link-only books can be shared but shouldn't turn up in search.
      noindex: b.visibility === "unlisted",
      lastmod: b.updated_at,
    };
  });

  return routes;
}

async function loadRoutes(env = process.env) {
  const [books, events, teams] = await Promise.all([
    readTable(env, "books", "slug,title,description,cover_url,source,drive_file_id,pdf_url,visibility,updated_at"),
    readTable(env, "event_pages", "id,data,updated_at"),
    readTable(env, "team_pages", "id,data,updated_at"),
  ]);
  return buildRoutes({ books, events, teams });
}

// How many members there are (for {members} in answers) -> "" when unknown.
async function memberCount(env = process.env) {
  const url = env.REACT_APP_SUPABASE_URL;
  const key = env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) return "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/members?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
      signal: controller.signal,
    });
    const total = Number(((res.headers.get("content-range") || "").split("/")[1] || "").trim());
    return res.ok && total > 0 ? total.toLocaleString("en-US") : "";
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

// What the answer pages need: the help assistant's questions, the contact
// details (/admin/contact) and the member count.
async function loadAnswers(env = process.env) {
  const [faqs, contactRows, members] = await Promise.all([
    readTable(env, "faqs", "*"),
    readTable(env, "contact_info", "id,data"),
    memberCount(env),
  ]);
  const row = contactRows.find((r) => r && r.id === 1) || contactRows[0];
  return { faqs, contact: (row && row.data) || {}, members };
}

module.exports = { buildRoutes, loadRoutes, loadAnswers, bookImage };
