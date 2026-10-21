// Structured data (schema.org JSON-LD) that tells search engines and AI
// answer tools what a page is about: breadcrumbs, events, books. It only
// describes what the page already shows; nothing here is visible.
import { SITE_URL, SITE_NAME_EN, absoluteUrl } from "./site";

export const ORG = { "@id": `${SITE_URL}/#org` };

// Home › … › this page, from the addresses above it that are real pages.
// titles: { [path]: title } for the pages that may appear in the trail.
export function breadcrumbs(path, title, titles) {
  const parts = String(path || "/").split("/").filter(Boolean);
  const trail = [{ name: "முகப்பு", path: "/" }];
  for (let i = 1; i < parts.length; i++) {
    const p = `/${parts.slice(0, i).join("/")}`;
    if (titles[p]) trail.push({ name: titles[p], path: p });
  }
  if (parts.length && title) trail.push({ name: title, path: `/${parts.join("/")}` });
  if (trail.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: absoluteUrl(t.path) })),
  };
}

// Gregorian month names only: Tamil calendar months (தை, சித்திரை…) don't
// line up with them.
const MONTHS = [
  ["jan", "ஜனவரி"],
  ["feb", "பெப்ரவரி", "பிப்ரவரி", "பெப்"],
  ["mar", "மார்ச்"],
  ["apr", "ஏப்ரல்"],
  ["may", "மே"],
  ["jun", "ஜூன்", "யூன்"],
  ["jul", "ஜூலை", "யூலை"],
  ["aug", "ஆகஸ்ட்", "ஆகஸ்டு", "ஓகஸ்ட்"],
  ["sep", "செப்டம்பர்", "செப்டெம்பர்"],
  ["oct", "ஒக்டோபர்", "அக்டோபர்"],
  ["nov", "நவம்பர்", "நொவெம்பர்"],
  ["dec", "டிசம்பர்", "டிசெம்பர்"],
];
const pad = (n) => String(n).padStart(2, "0");
const valid = (y, m, d) => {
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};

// A date typed into an event page ("2026-03-15", "15/03/2026", "15 March
// 2026", "மார்ச் 15, 2026") as YYYY-MM-DD, or "" when it can't be read for
// certain. Ranges ("15–16 March 2026") give the first day.
export function parseEventDate(text) {
  const s = String(text || "").toLowerCase();
  let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m && valid(+m[1], +m[2], +m[3])) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/);
  if (m && valid(+m[3], +m[2], +m[1])) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  const year = s.match(/\b(20\d{2}|19\d{2})\b/);
  if (!year) return "";
  const month = MONTHS.findIndex((names) => names.some((n) => s.includes(n)));
  if (month < 0) return "";
  const day = s.replace(year[0], " ").match(/\b(\d{1,2})\b/);
  if (!day || !valid(+year[1], month + 1, +day[1])) return "";
  return `${year[1]}-${pad(month + 1)}-${pad(day[1])}`;
}

// Events on a page: its main date and venue (intro or programme section),
// and each competition with a date. Only events with both a date and a place
// are described, since Google ignores events without them.
export function eventSchemas(page, url) {
  const sections = (page.sections || []).filter((s) => !s.hidden);
  const image = page.image && /^https?:\/\//.test(page.image) ? page.image : absoluteUrl(`/og/${page.id}.jpg`);
  const base = {
    "@context": "https://schema.org",
    "@type": "Event",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: { "@type": "Organization", ...ORG, name: SITE_NAME_EN, url: `${SITE_URL}/` },
    image: [image],
    inLanguage: "ta",
  };
  const place = (venue) => ({ "@type": "Place", name: venue, address: { "@type": "PostalAddress", streetAddress: venue, addressCountry: "LK" } });
  const out = [];

  const main = sections.find((s) => (s.type === "intro" || s.type === "agenda") && parseEventDate(s.date) && (s.venue || "").trim());
  if (main) {
    out.push({
      ...base,
      name: page.title,
      description: page.summary || main.text || main.lead || page.title,
      startDate: parseEventDate(main.date),
      location: place(main.venue.trim()),
      url,
    });
  }
  sections
    .filter((s) => s.type === "competitions")
    .forEach((s) =>
      (s.items || [])
        .filter((c) => c.date && (c.venue || "").trim())
        .forEach((c) =>
          out.push({
            ...base,
            name: `${c.name} · ${page.title}`,
            description: c.description || page.summary || c.name,
            startDate: c.date,
            location: place(c.venue.trim()),
            ...(c.poster && /^https?:\/\//.test(c.poster) ? { image: [c.poster] } : {}),
            url: `${url}#${c.id}`,
          })
        )
    );
  return out;
}

export function bookSchema(book, image) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    url: absoluteUrl(`/books/${book.slug}`),
    ...(book.description ? { description: book.description } : {}),
    ...(book.author ? { author: { "@type": "Person", name: book.author } } : { author: { "@type": "Organization", ...ORG, name: SITE_NAME_EN } }),
    ...(book.year ? { datePublished: String(book.year) } : {}),
    ...(image ? { image: absoluteUrl(image) } : {}),
    publisher: { "@type": "Organization", ...ORG, name: SITE_NAME_EN },
    inLanguage: "ta",
  };
}

// TLA itself, for the home page: adds the contact details from /admin/contact
// and the university's address to the organisation in index.html (same @id,
// so search engines merge the two).
export function organizationSchema(contact = {}) {
  const sameAs = [contact.facebookUrl, contact.youtubeUrl, contact.instagramUrl, contact.linkedinUrl, contact.xUrl].filter((u) => /^https?:\/\//.test(u || ""));
  const phone = String(contact.phoneNumber || "").replace(/[^\d+]/g, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    ...ORG,
    name: SITE_NAME_EN,
    // the same names as the organisation in index.html, so the two agree
    alternateName: [
      "TLA UoM",
      "TLAUOM",
      "Tamil Literary Association",
      "Thamizh Literary Association",
      "Thamizh Literary Association, University of Moratuwa",
      "தமிழ் இலக்கிய மன்றம்",
      "மொறட்டுவைப் பல்கலைக்கழக தமிழ் இலக்கிய மன்றம்",
    ],
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    ...(contact.email ? { email: contact.email } : {}),
    ...(phone ? { telephone: phone.startsWith("0") ? `+94${phone.slice(1)}` : phone } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: "University of Moratuwa, Katubedda",
      addressLocality: "Moratuwa",
      postalCode: "10400",
      addressCountry: "LK",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}
