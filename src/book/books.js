// Books shown at /books and /books/:slug: rows in the Supabase `books` table
// (see supabase/migrations/books.sql), managed at /admin/books (Books tab).
//
// A book's PDF is either a Google Drive file (`source: "drive"`, opened through
// Drive's own viewer) or a PDF uploaded to Cloudinary (`source: "upload"`). An
// optional Word document is any Drive / Google Docs link.
//
// Covers: the card on /books shows the admin's uploaded photo (cover_url) and
// the book's own page shows the PDF's first page; each falls back to the other
// when its picture is missing or can't load. Link previews use the photo.
// (The old `cover_choice` column is no longer used.)
import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import { deleteImages } from "../shared/cloudinaryUpload";

const TABLE = "books";
// "*" rather than a column list, so a column added by a later books.sql (e.g.
// page_count) never breaks reading before the SQL has been run.
const COLUMNS = "*";
const LS_KEY = "tla_books_v1";
const PAGES_KEY = "tla_book_pages_v1";

export const CATEGORIES = [
  ["tla", "TLA publication"],
  ["student", "University students' publication"],
];
export const VISIBILITIES = [
  ["listed", "Listed", "On the Books page and at its own link"],
  ["unlisted", "Link only", "Only at its own link / QR code, not on the Books page"],
  ["hidden", "Hidden", "Nobody but admins can open it"],
];

// /books/submit is the submission guidelines page, so no book may take it.
const RESERVED_SLUGS = ["submit"];
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;

export function slugError(slug) {
  if (!slug) return "Give the book a web address.";
  if (!SLUG_RE.test(slug)) return "Use 2-49 lower-case English letters, numbers and dashes (e.g. thamilaruvi-27).";
  if (RESERVED_SLUGS.includes(slug)) return `"${slug}" is taken by another page - pick a different one.`;
  return "";
}

// "Thamilaruvi '27 Book" -> "thamilaruvi-27-book". Tamil-only titles give "".
export const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 49);

// Accepts every usual shape of Drive / Docs link, or a bare file id:
//   https://drive.google.com/file/d/<id>/view?usp=sharing
//   https://drive.google.com/open?id=<id>   https://drive.google.com/uc?id=<id>&export=download
//   https://docs.google.com/document/d/<id>/edit
// -> the file id, or "" when there isn't one.
export function parseDriveId(link) {
  const s = String(link || "").trim();
  if (!s) return "";
  const m = s.match(/\/d\/([A-Za-z0-9_-]{20,})/) || s.match(/[?&]id=([A-Za-z0-9_-]{20,})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{20,}$/.test(s) ? s : "";
}

const isGoogleDoc = (link) => /docs\.google\.com\/document\//.test(link);
const isHttp = (link) => /^https?:\/\//i.test(link);

export const driveViewLink = (id) => `https://drive.google.com/file/d/${id}/view`;

// Whitelist + tidy so a bad row never breaks the books pages.
export function normalizeBook(r) {
  const o = r || {};
  const str = (v) => (typeof v === "string" ? v : "");
  const year = Number(o.year);
  return {
    id: o.id,
    slug: str(o.slug),
    title: str(o.title),
    author: str(o.author),
    year: o.year === null || o.year === undefined || o.year === "" || !Number.isFinite(year) ? null : Math.round(year),
    category: o.category === "student" ? "student" : "tla",
    description: str(o.description),
    source: o.source === "upload" ? "upload" : "drive",
    drive_file_id: str(o.drive_file_id),
    pdf_url: str(o.pdf_url),
    pdf_public_id: str(o.pdf_public_id),
    doc_link: str(o.doc_link),
    cover_url: str(o.cover_url),
    cover_public_id: str(o.cover_public_id),
    cover_choice: o.cover_choice === "upload" ? "upload" : "page",
    page_count: Number.isInteger(Number(o.page_count)) && Number(o.page_count) > 0 ? Number(o.page_count) : 0,
    visibility: VISIBILITIES.some(([v]) => v === o.visibility) ? o.visibility : "listed",
    sort_order: Number.isFinite(Number(o.sort_order)) ? Number(o.sort_order) : 0,
    created_at: o.created_at || null,
    updated_at: o.updated_at || null,
  };
}

// ---- Links for visitors --------------------------------------------------------------------

const cloudinaryVariant = (url, transform) => url.replace("/image/upload/", `/image/upload/${transform}/`);

export const hasPdf = (b) => (b.source === "upload" ? !!b.pdf_url : !!b.drive_file_id);

// What the reader iframe shows. Phones can't draw a PDF inside a page, so an
// uploaded PDF goes through Google's viewer there.
export function pdfViewUrl(b, { phone = false } = {}) {
  if (b.source === "upload") {
    return phone ? `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(b.pdf_url)}` : b.pdf_url;
  }
  return `https://drive.google.com/file/d/${b.drive_file_id}/preview`;
}

export function pdfDownloadUrl(b) {
  if (b.source === "upload") return cloudinaryVariant(b.pdf_url, "fl_attachment");
  return `https://drive.google.com/uc?export=download&id=${b.drive_file_id}`;
}

// Native Google Docs are fetched through the export endpoint, files uploaded
// to Drive through uc?export=download; any other link is used as it is.
export function docDownloadUrl(b) {
  const link = b.doc_link.trim();
  if (!link) return null;
  const id = parseDriveId(link);
  if (id && isGoogleDoc(link)) return `https://docs.google.com/document/d/${id}/export?format=docx`;
  if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
  return isHttp(link) ? link : null;
}

// Page `n` (1-based) of an uploaded PDF as a picture, `width` pixels wide.
// Cloudinary draws it from the PDF on first request and caches it after.
export const pdfPageImage = (b, n, width) =>
  cloudinaryVariant(b.pdf_url, `pg_${n},w_${width},c_limit,q_auto,f_auto`).replace(/\.pdf$/i, ".jpg");

// The PDF's first page as a picture. A Drive thumbnail only loads while the
// file is shared "Anyone with the link".
function firstPageUrl(b, width) {
  if (b.source === "upload" && b.pdf_url) return pdfPageImage(b, 1, width);
  if (b.source !== "upload" && b.drive_file_id) return `https://drive.google.com/thumbnail?id=${b.drive_file_id}&sz=w${width}`;
  return "";
}

// The two cover pictures in the order they're tried:
//   "card" - the card on /books: the uploaded photo, else the first page
//   "page" - the book's own page: the first page, else the photo
function coverPair(b, width, kind) {
  const photo = b.cover_url || "";
  const page = firstPageUrl(b, width);
  const [main, other] = kind === "page" ? [page, photo] : [photo, page];
  return [main || other, main && other && other !== main ? other : ""];
}

// The picture a book shows: kind "card" (default) or "page" (see coverPair).
export const coverUrl = (b, width = 600, kind = "card") => coverPair(b, width, kind)[0];

// The other picture, tried when the first one fails to load (e.g. a Drive
// file that isn't shared publicly). "" when there is none.
export const coverFallback = (b, width = 600, kind = "card") => coverPair(b, width, kind)[1];

// For link previews (WhatsApp, Facebook): the photo, else the first page.
export const shareImageUrl = (b) => coverUrl(b, 1200, "card");

// [src, onError] for a cover <img>: switches to the other picture once if the
// first one can't be loaded.
export function useCover(b, width = 600, kind = "card") {
  const main = b ? coverUrl(b, width, kind) : "";
  const fallback = b ? coverFallback(b, width, kind) : "";
  const [failed, setFailed] = useState("");
  const src = failed === main && fallback ? fallback : main;
  const onError = () => {
    if (failed !== main && fallback) setFailed(main);
  };
  return [src, onError];
}

// ---- Built-in fallback ---------------------------------------------------------------------

// The books that used to be hard-coded here. Used only when the table can't be
// read (books.sql not run yet, or Supabase is down) so /books/tla26, which is
// printed on QR codes, keeps working.
export const BUILT_IN_BOOKS = [
  {
    slug: "thamilaruvi26",
    title: "தமிழருவி'26 இதழ்",
    year: 2026,
    category: "tla",
    description:
      "தமிழ் இலக்கிய மன்றம் — தமிழருவி'26 நூல். PDF அல்லது Document வடிவில் படிக்கவும், பதிவிறக்கவும்.",
    source: "drive",
    drive_file_id: "1MAR2g8M0ZhaNip4eSHk6hfwBYoBVy3IF",
    doc_link: "https://docs.google.com/document/d/1lyxBng9S_Kpjzh3EqBKi8WywJLtVoLXD/edit",
    cover_url: "/images/books/thamilaruvi26-cover.webp",
    visibility: "listed",
    sort_order: 0,
  },
  {
    slug: "tla26",
    title: "TLA 26",
    year: 2026,
    category: "tla",
    description: "தமிழ் இலக்கிய மன்றம் — TLA 26 நூல். Read and download the TLA 26 book.",
    source: "drive",
    drive_file_id: "1tVvDgXaQXHyEvBQOUYnu5O0oIjpdZDbS",
    visibility: "unlisted",
    sort_order: 1,
  },
].map(normalizeBook);

// ---- Reading -------------------------------------------------------------------------------

const byOrder = (a, b) => a.sort_order - b.sort_order || String(a.created_at).localeCompare(String(b.created_at));

// Visitors get listed and link-only books (row-level security); main admins
// get every book. Throws when the table can't be read.
export async function fetchBooks() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message || "Couldn't read the books.");
  return (data || []).map(normalizeBook).sort(byOrder);
}

function readCache() {
  try {
    const list = JSON.parse(localStorage.getItem(LS_KEY));
    return Array.isArray(list) ? list.map(normalizeBook) : null;
  } catch {
    return null;
  }
}

function writeCache(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

// The books on the /books page, in order. Starts from the last answer so a
// returning visitor sees them on first paint; null while loading the first time.
export function useListedBooks() {
  const [books, setBooks] = useState(readCache);

  useEffect(() => {
    let alive = true;
    fetchBooks()
      .then((rows) => {
        const list = rows.filter((b) => b.visibility === "listed");
        writeCache(list);
        if (alive) setBooks(list);
      })
      .catch(() => {
        if (alive) setBooks((cur) => cur || BUILT_IN_BOOKS.filter((b) => b.visibility === "listed"));
      });
    return () => {
      alive = false;
    };
  }, []);

  return books;
}

// One book for /books/:slug -> undefined while loading, null when there's no
// such book (or it's hidden and this isn't an admin).
export function useBook(slug) {
  const [book, setBook] = useState(undefined);

  useEffect(() => {
    let alive = true;
    setBook(undefined);
    supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setBook(BUILT_IN_BOOKS.find((b) => b.slug === slug) || null);
        else setBook(data ? normalizeBook(data) : null);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  return book;
}

// How many pages an uploaded PDF has -> 0 while unknown. Saved on upload;
// for books uploaded before that, asks Cloudinary (a page past the end fails
// to load) and remembers the answer in this browser.
function pageExists(b, n) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = pdfPageImage(b, n, 8);
  });
}

async function probePageCount(b) {
  if (!(await pageExists(b, 1))) return 0;
  let lo = 1; // known to exist
  let hi = 2;
  while (hi <= 4096 && (await pageExists(b, hi))) {
    lo = hi;
    hi *= 2;
  }
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (await pageExists(b, mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

function readPages() {
  try {
    return JSON.parse(localStorage.getItem(PAGES_KEY)) || {};
  } catch {
    return {};
  }
}

export function usePageCount(book) {
  const key = book && book.source === "upload" ? book.pdf_url : "";
  const saved = book ? book.page_count : 0;
  const [count, setCount] = useState(() => saved || (key && readPages()[key]) || 0);

  useEffect(() => {
    if (!key) return undefined;
    if (saved) {
      setCount(saved);
      return undefined;
    }
    const known = readPages()[key];
    if (known) {
      setCount(known);
      return undefined;
    }
    let alive = true;
    probePageCount({ pdf_url: key }).then((n) => {
      if (!alive || !n) return;
      setCount(n);
      try {
        localStorage.setItem(PAGES_KEY, JSON.stringify({ ...readPages(), [key]: n }));
      } catch {
        /* ignore */
      }
    });
    return () => {
      alive = false;
    };
  }, [key, saved]);

  return count;
}

// ---- Writing (main admins) -----------------------------------------------------------------

const EDITABLE = [
  "slug",
  "title",
  "author",
  "year",
  "category",
  "description",
  "source",
  "drive_file_id",
  "pdf_url",
  "pdf_public_id",
  "doc_link",
  "cover_url",
  "cover_public_id",
  "page_count",
  "visibility",
];

// Row-level security turns "not allowed" into "0 rows", not an error.
function needRow(data) {
  if (!data || (Array.isArray(data) && !data.length)) throw new Error("Nothing was saved - only main admins can change books.");
}

function saveError(error) {
  if (error.code === "23505") return new Error("Another book already uses this web address - pick a different one.");
  return new Error(error.message || "Could not save the book.");
}

// Inserts when `id` is missing, updates otherwise. -> the saved row.
export async function saveBook(book, sortOrder) {
  const clean = normalizeBook(book);
  const body = {};
  EDITABLE.forEach((k) => {
    body[k] = typeof clean[k] === "string" ? clean[k].trim() : clean[k];
  });
  const write = (b) =>
    (book.id ? supabase.from(TABLE).update(b).eq("id", book.id) : supabase.from(TABLE).insert({ ...b, sort_order: sortOrder })).select(COLUMNS);
  let { data, error } = await write(body);
  // A column from a later part of books.sql (page_count, cover_choice) that
  // hasn't been added yet - save without it.
  const rest = { ...body };
  for (let tries = 0; tries < 2 && error && error.code === "PGRST204"; tries += 1) {
    const msg = error.message || "";
    const missing = ["page_count", "cover_choice"].find((k) => k in rest && msg.includes(k));
    if (!missing) break;
    delete rest[missing];
    ({ data, error } = await write(rest));
  }
  if (error) throw saveError(error);
  needRow(data);
  return normalizeBook(data[0]);
}

export async function setBookVisibility(id, visibility) {
  const { data, error } = await supabase.from(TABLE).update({ visibility }).eq("id", id).select("id");
  if (error) throw new Error(error.message || "Could not save.");
  needRow(data);
}

// Removes the row, then its PDF and cover on Cloudinary (best effort).
export async function removeBook(book) {
  const { data, error } = await supabase.from(TABLE).delete().eq("id", book.id).select("id");
  if (error) throw new Error(error.message || "Could not delete.");
  needRow(data);
  const files = [book.pdf_public_id, book.cover_public_id].filter(Boolean);
  if (files.length) await deleteImages(files);
}

// `rows` is the new order; numbers them 0..n-1, saving only what changed.
export async function saveBookOrder(rows) {
  const results = await Promise.all(
    rows.map((r, i) => (r.sort_order === i ? null : supabase.from(TABLE).update({ sort_order: i }).eq("id", r.id)))
  );
  const failed = results.find((r) => r && r.error);
  if (failed) throw new Error(failed.error.message || "Could not save the order.");
}
