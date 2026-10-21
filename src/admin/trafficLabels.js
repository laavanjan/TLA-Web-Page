// Plain-language names, icons and colours for the Traffic page: where visits
// came from, the site's pages, countries, devices and the funnels.
import {
  FaGoogle,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTiktok,
  FaYoutube,
  FaLinkedinIn,
  FaTwitter,
  FaRedditAlien,
  FaTelegramPlane,
  FaQrcode,
  FaEnvelope,
  FaLink,
  FaGlobe,
  FaSearch,
  FaRobot,
  FaBullhorn,
} from "react-icons/fa";

// Chart colours, checked for colour-blind safety on the admin's dark cards.
export const COLORS = {
  visitors: "#c98500",
  views: "#3987e5",
  devices: { mobile: "#3987e5", desktop: "#d95926", tablet: "#199e70" },
};

export const SOURCES = {
  direct: { label: "Direct / typed in", icon: FaLink, hint: "Typed the address, a bookmark, or an app that hides where it came from" },
  google: { label: "Google", icon: FaGoogle },
  bing: { label: "Bing", icon: FaSearch },
  duckduckgo: { label: "DuckDuckGo", icon: FaSearch },
  yahoo: { label: "Yahoo", icon: FaSearch },
  instagram: { label: "Instagram", icon: FaInstagram },
  facebook: { label: "Facebook", icon: FaFacebookF },
  whatsapp: { label: "WhatsApp", icon: FaWhatsapp },
  tiktok: { label: "TikTok", icon: FaTiktok },
  youtube: { label: "YouTube", icon: FaYoutube },
  linkedin: { label: "LinkedIn", icon: FaLinkedinIn },
  twitter: { label: "X / Twitter", icon: FaTwitter },
  reddit: { label: "Reddit", icon: FaRedditAlien },
  telegram: { label: "Telegram", icon: FaTelegramPlane },
  chatgpt: { label: "ChatGPT", icon: FaRobot },
  qr: { label: "QR code / poster", icon: FaQrcode },
  email: { label: "Email", icon: FaEnvelope },
  other: { label: "Other websites", icon: FaGlobe },
};

export function sourceMeta(key) {
  return SOURCES[key] || { label: key.charAt(0).toUpperCase() + key.slice(1), icon: FaBullhorn };
}

// Friendly names for the site's pages. Pages with a stored title (books,
// events made in the admin) use that instead where it reads better.
const PAGES = [
  [/^\/$/, "Home"],
  [/^\/books$/, "Books"],
  [/^\/books\/submit$/, "Book submission guidelines"],
  [/^\/books\/submit\/form$/, "Book submission form"],
  [/^\/teams$/, "Teams"],
  [/^\/teams\/join$/, "Join a team (form)"],
  [/^\/members$/, "Members"],
  [/^\/seniors$/, "Seniors"],
  [/^\/history$/, "Our history"],
  [/^\/contact$/, "Contact"],
  [/^\/memory-sharing$/, "Memory sharing"],
  [/^\/frame$/, "Photo frame"],
  [/^\/vote$/, "Makkal Mantram vote"],
  [/^\/ideathon$/, "Ideathon"],
  [/^\/login$/, "Log in"],
  [/^\/signup$/, "Sign up"],
];

const words = (slug) =>
  decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Titles look like "Books · தமிழ் இலக்கிய மன்றம்"; keep the part before the dot.
const shortTitle = (title) => (title || "").split(/\s[·|–-]\s/)[0].trim();

export function pageName(path, title) {
  const known = PAGES.find(([re]) => re.test(path));
  if (known) return known[1];
  const short = shortTitle(title);
  let m = path.match(/^\/books\/([^/]+)$/);
  if (m) return short && short !== "Books" ? `Book · ${short}` : `Book · ${words(m[1])}`;
  m = path.match(/^\/events\/([^/]+)(?:\/(.+))?$/);
  if (m) return `Event · ${words(m[1])}${m[2] ? ` › ${words(m[2])}` : ""}`;
  m = path.match(/^\/teams\/([^/]+)$/);
  if (m) return short && short !== "Teams" ? `Team · ${short}` : `Team ${words(m[1])}`;
  return short || path;
}

export const isBookPage = (path) => /^\/books\/(?!submit)[^/]+$/.test(path);

let regionNames = null;
export function countryName(code) {
  if (!code) return "Unknown";
  try {
    regionNames = regionNames || new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code) || code;
  } catch (e) {
    return code;
  }
}

// "LK" → 🇱🇰
export const flag = (code) =>
  /^[A-Z]{2}$/.test(code || "") ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "🌐";

export const DEVICES = { mobile: "Phone", desktop: "Computer", tablet: "Tablet" };

export const EVENTS = {
  team_join_submitted: "Team join applications sent",
  book_submitted: "Books submitted",
};

// Visit → form → sent. Steps match a page (and the pages under it) or an event.
export const FUNNELS = [
  {
    id: "join",
    title: "Joining a team",
    steps: [
      { label: "Visited the site", step: { any: true } },
      { label: "Looked at the teams", step: { path: "/teams" } },
      { label: "Opened the join form", step: { path: "/teams/join" } },
      { label: "Sent an application", step: { event: "team_join_submitted" } },
    ],
  },
  {
    id: "books",
    title: "Submitting a book",
    steps: [
      { label: "Visited the site", step: { any: true } },
      { label: "Looked at the books", step: { path: "/books" } },
      { label: "Opened the submission form", step: { path: "/books/submit/form" } },
      { label: "Submitted a book", step: { event: "book_submitted" } },
    ],
  },
];
