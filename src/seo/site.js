// The website's address and name, used for canonical links and share
// previews. scripts/seo-build.js uses the same values for the pages it writes
// at build time.
export const SITE_URL = "https://tlauom.com";
export const SITE_NAME = "தமிழ் இலக்கிய மன்றம்";
export const SITE_NAME_EN = "Tamil Literary Association, University of Moratuwa";
export const DEFAULT_IMAGE = "/og/home.jpg";

// "/books/" → "https://tlauom.com/books"; already-absolute addresses are kept.
export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = `/${String(path).replace(/^\/+/, "")}`.split(/[?#]/)[0];
  const trimmed = clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  return `${SITE_URL}${trimmed === "/" ? "/" : trimmed}`;
}

// Search results show about 155 characters; cut at a word near there.
export function clip(text, max = 160) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}
