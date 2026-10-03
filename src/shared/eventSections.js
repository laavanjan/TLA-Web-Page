// What an event page is made of: the section types an admin can add, how a
// blank one looks, and how anything coming out of the database (or a draft in
// the admin) is cleaned before the site uses it. The event counterpart of the
// section code in teamPages.js; the two share the competitions, timeline,
// gallery, YouTube and Instagram sections.
import { safeUrl, safeImage } from "./mediaLinks";
import { blankTimelineItem, blankCompetition, newId } from "./teamPages";

export { newId };

// Order here is the order of the "Add a section" picker.
export const EVENT_SECTION_TYPES = [
  "intro",
  "text",
  "agenda",
  "gallery",
  "awards",
  "rules",
  "cards",
  "competitions",
  "sponsors",
  "contacts",
  "facts",
  "editions",
  "timeline",
  "youtube",
  "instagram",
  "live",
];

// Built-in blocks that load their content from the server (seminars, district
// results, …). They can be moved or hidden here, but not edited.
export const LIVE_BLOCKS = ["sotkanai-districts", "aramiyam-seminars", "ideathon-agenda", "ideathon-rules", "brammam-about"];

// The groups on the home page. `band` decides which cards share a background
// stripe, so the page keeps its alternating look.
export const EVENT_CATEGORIES = [
  {
    id: "culture",
    band: 0,
    title: "கலை கலாச்சார நிகழ்வுகள்",
    intro:
      "பல்கலையில் பயிலும் தமிழ் மாணவர்களின் இயல், இசை, நாடகம் போன்ற கலைத்திறமைகளை வெளி உலகிற்கு பறைசாற்றிட மொறட்டுவை பல்கலைக்கழக தமிழ் மாணவர்களால் கோலாகலமாக நடத்தப்படும் நிகழ்வுகள்",
  },
  {
    id: "competition",
    band: 0,
    title: "போட்டிகள்",
    intro:
      "தமிழர் தேசம் எங்கிலும் பரந்து வாழும் பாடசாலை மாணவர்களின் பல்முக திறமைகளுக்கு களம் அமைத்து அகில இலங்கைரீதியில் அந்த சாதனை வீர்ர்களுக்கு அங்கீகாரத்தை வழங்க தமிழ் இலக்கிய மன்றத்தால் பெருமையுடன் நடாத்தபடும் போட்டிகள்",
  },
  {
    id: "guidance",
    band: 1,
    title: "தொழில் வழிகாட்டுதல்",
    intro:
      "தாங்கள் கடந்து வந்த அனுபவங்களையும் படிப்பினைகளையும் தமது தம்பி, தங்கைகளுக்கும் கூறி அவர்களை வழிநடத்தி அவர்களின் இலக்குகளை அடைய கைகோர்க்கும் சிரேஷ்ட மாணவர்களுக்கும் பல்கலைக்கழக மாணவர்களுக்குமான உறவுப்பாலம்",
  },
  {
    id: "social",
    band: 2,
    title: "சமூக தொடர்பு",
    intro:
      "ஏட்டுக்கல்வி முதல் பல்கலைக்கழகம் வரை தன்னை வழிப்படுத்தி ஒரு ஆளுமை மிக்க மாணவனாய் செதுக்கி தன்னை உருவாக்கிய இந்த சமூகத்திற்கு தன்னால் முடிந்த எதோ ஒன்றை செய்தே ஆகவேன்றும் என்ற ஒரு ஏக்கத்தின் வெளிப்பாடுகள்",
  },
  {
    id: "carnival",
    band: 2,
    title: "களியாட்டங்கள்",
    intro:
      "ஓடி ஓடி களைத்திருக்கும் பல்கலைக்கழக மாணவர்கள் ஒய்யாரமாக கதைபேசி சக நண்பர்களுடன் உறவாடி கவலைகளை மறந்திருக்கும் தருணங்கள்",
  },
];

export const CATEGORY_IDS = EVENT_CATEGORIES.map((c) => c.id);

export const DEFAULT_TITLES = {
  intro: "",
  text: "நிகழ்வு பற்றி",
  agenda: "நிகழ்ச்சி நிரல்",
  gallery: "கலை காட்சி கூடம்",
  awards: "வெற்றியாளர்கள்",
  rules: "போட்டி விதிமுறைகள்",
  cards: "விபரங்கள்",
  competitions: "போட்டிகள்",
  sponsors: "அனுசரணை வழங்குவோர்",
  contacts: "தொடர்புகளுக்கு",
  facts: "முக்கிய விபரங்கள்",
  editions: "கடந்த ஆண்டுகள்",
  timeline: "எமது பயணம்",
  youtube: "காணொளிகள்",
  instagram: "Instagram பதிவுகள்",
  live: "",
};

// ---- Blank rows ----------------------------------------------------------------

export const blankImage = (url = "") => ({ id: newId("g"), url, caption: "", width: 0, height: 0 });
export const blankAgendaItem = () => ({ id: newId("a"), time: "", title: "", detail: "", linkUrl: "", linkLabel: "" });
export const blankSponsor = () => ({ id: newId("sp"), tier: "", name: "", logo: "", text: "", url: "" });
export const blankAward = () => ({ id: newId("aw"), place: "", name: "", detail: "", image: "" });
export const blankRule = (text = "") => ({ id: newId("r"), text });
export const blankCard = () => ({ id: newId("cd"), title: "", text: "", image: "", images: [], url: "", urlLabel: "" });
export const blankContact = () => ({ id: newId("ct"), name: "", role: "", phone: "", email: "" });
export const blankFact = () => ({ id: newId("f"), label: "", value: "" });
export const blankEdition = (year = String(new Date().getFullYear())) => ({
  id: newId("ed"),
  year,
  title: "",
  text: "",
  images: [],
  videoUrl: "",
});

export function blankSection(type) {
  const base = { id: newId(), type, title: DEFAULT_TITLES[type] || "", hidden: false };
  switch (type) {
    case "intro":
      return { ...base, text: "", image: "", date: "", venue: "", buttonLabel: "", buttonUrl: "" };
    case "text":
      return { ...base, text: "", buttonLabel: "", buttonUrl: "" };
    case "agenda":
      return { ...base, lead: "", heading: "", date: "", time: "", venue: "", items: [blankAgendaItem()], images: [] };
    case "gallery":
      return { ...base, images: [] };
    case "awards":
      return { ...base, items: [blankAward()] };
    case "rules":
      return { ...base, items: [blankRule()], collapsible: false, buttonLabel: "" };
    case "cards":
      return { ...base, items: [blankCard()] };
    case "competitions":
      return { ...base, items: [blankCompetition()] };
    case "sponsors":
      return { ...base, items: [blankSponsor()] };
    case "contacts":
      return { ...base, items: [blankContact()], note: "" };
    case "facts":
      return { ...base, items: [blankFact()], note: "" };
    case "editions":
      return { ...base, items: [blankEdition()] };
    case "timeline":
      return { ...base, items: [blankTimelineItem()] };
    case "live":
      return { ...base, block: LIVE_BLOCKS[0] };
    default:
      return { ...base, links: [] };
  }
}

export function blankEventPage(title = "", category = "culture") {
  const intro = blankSection("intro");
  return { title, summary: "", image: "", category, sections: [intro] };
}

// ---- Cleaning ------------------------------------------------------------------

const str = (v, max = 5000) => String(v == null ? "" : v).slice(0, max).trim();
const list = (arr, fn) => (Array.isArray(arr) ? arr.map(fn).filter(Boolean) : []);
const dim = (v) => {
  const n = Math.round(Number(v));
  return n > 0 && n <= 20000 ? n : 0;
};

// A button/link target: an https link, or a path on this site ("/events/ppl").
// "//host" is not a path - browsers read it as another site.
const linkTarget = (v) => {
  const s = str(v, 500);
  return /^\/(?!\/)[^\s]*$/.test(s) ? s : safeUrl(s);
};

function cleanImage(raw) {
  const r = typeof raw === "string" ? { url: raw } : raw || {};
  const url = safeImage(r.url);
  if (!url) return null;
  return {
    id: str(r.id, 80) || newId("g"),
    url,
    caption: str(r.caption, 300),
    width: dim(r.width),
    height: dim(r.height),
  };
}

// Rows are kept when they have anything in them; a row of empty boxes is dropped.
const row = (id, prefix, fields) => (fields.some(Boolean) ? { id: str(id, 80) || newId(prefix) } : null);

function sanitizeSection(raw) {
  const r = raw || {};
  if (!EVENT_SECTION_TYPES.includes(r.type)) return null;
  const base = {
    id: str(r.id, 80) || newId(),
    type: r.type,
    title: str(r.title, 200),
    hidden: !!r.hidden,
  };
  switch (r.type) {
    case "intro":
      return {
        ...base,
        text: str(r.text, 5000),
        image: safeImage(r.image),
        date: str(r.date, 120),
        venue: str(r.venue, 300),
        buttonLabel: str(r.buttonLabel, 80),
        buttonUrl: linkTarget(r.buttonUrl),
      };
    case "text":
      return {
        ...base,
        text: str(r.text, 20000),
        buttonLabel: str(r.buttonLabel, 80),
        buttonUrl: linkTarget(r.buttonUrl),
      };
    case "agenda":
      return {
        ...base,
        lead: str(r.lead, 500),
        heading: str(r.heading, 200),
        date: str(r.date, 120),
        time: str(r.time, 120),
        venue: str(r.venue, 300),
        items: list(r.items, (a) => {
          const x = {
            time: str(a && a.time, 80),
            title: str(a && a.title, 300),
            detail: str(a && a.detail, 2000),
            linkUrl: linkTarget(a && a.linkUrl),
            linkLabel: str(a && a.linkLabel, 80),
          };
          const k = row(a && a.id, "a", [x.time, x.title, x.detail]);
          return k && { ...k, ...x };
        }),
        images: list(r.images, cleanImage),
      };
    case "gallery":
      return { ...base, images: list(r.images, cleanImage) };
    case "awards":
      return {
        ...base,
        items: list(r.items, (a) => {
          const x = {
            place: str(a && a.place, 200),
            name: str(a && a.name, 300),
            detail: str(a && a.detail, 1000),
            image: safeImage(a && a.image),
          };
          const k = row(a && a.id, "aw", [x.place, x.name, x.detail, x.image]);
          return k && { ...k, ...x };
        }),
      };
    case "rules":
      return {
        ...base,
        collapsible: !!r.collapsible,
        buttonLabel: str(r.buttonLabel, 200),
        items: list(r.items, (x) => {
          const text = str(typeof x === "string" ? x : x && x.text, 3000);
          return text ? { id: str(x && x.id, 80) || newId("r"), text } : null;
        }),
      };
    case "cards":
      return {
        ...base,
        items: list(r.items, (c) => {
          const x = {
            title: str(c && c.title, 300),
            text: str(c && c.text, 5000),
            image: safeImage(c && c.image),
            images: list(c && c.images, cleanImage),
            url: linkTarget(c && c.url),
            urlLabel: str(c && c.urlLabel, 80),
          };
          const k = row(c && c.id, "cd", [x.title, x.text, x.image, x.images.length]);
          return k && { ...k, ...x };
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
            poster: safeImage(c.poster),
            description: str(c.description, 5000),
            registerUrl: safeUrl(c.registerUrl),
            recordingUrl: safeUrl(c.recordingUrl),
            winners: [0, 1, 2].map((i) => str(winners[i], 200)),
          };
        }),
      };
    case "sponsors":
      return {
        ...base,
        items: list(r.items, (s) => {
          const x = {
            tier: str(s && s.tier, 120),
            name: str(s && s.name, 300),
            logo: safeImage(s && s.logo),
            text: str(s && s.text, 2000),
            url: safeUrl(s && s.url),
          };
          const k = row(s && s.id, "sp", [x.name, x.logo, x.text, x.tier]);
          return k && { ...k, ...x };
        }),
      };
    case "contacts":
      return {
        ...base,
        note: str(r.note, 1000),
        items: list(r.items, (c) => {
          const x = { name: str(c && c.name, 200), role: str(c && c.role, 200), phone: str(c && c.phone, 40), email: str(c && c.email, 200) };
          const k = row(c && c.id, "ct", [x.name, x.phone, x.email]);
          return k && { ...k, ...x };
        }),
      };
    case "facts":
      return {
        ...base,
        note: str(r.note, 1000),
        items: list(r.items, (f) => {
          const x = { label: str(f && f.label, 300), value: str(f && f.value, 1000) };
          const k = row(f && f.id, "f", [x.label, x.value]);
          return k && { ...k, ...x };
        }),
      };
    case "editions":
      return {
        ...base,
        items: list(r.items, (e) => {
          const year = str(e && e.year, 20);
          if (!year) return null;
          return {
            id: str(e.id, 80) || newId("ed"),
            year,
            title: str(e.title, 300),
            text: str(e.text, 10000),
            images: list(e.images, cleanImage),
            videoUrl: safeUrl(e.videoUrl),
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
    case "live":
      return LIVE_BLOCKS.includes(r.block) ? { ...base, block: r.block } : null;
    default:
      // youtube / instagram
      return { ...base, links: list(r.links, (u) => safeUrl(u) || null) };
  }
}

export function sanitizeEventPage(raw, builtIn) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.sections)) {
    return builtIn || blankEventPage();
  }
  return {
    title: str(raw.title, 200) || (builtIn && builtIn.title) || "",
    summary: str(raw.summary, 5000),
    image: safeImage(raw.image),
    category: CATEGORY_IDS.includes(raw.category) ? raw.category : (builtIn && builtIn.category) || "culture",
    sections: list(raw.sections, sanitizeSection),
  };
}

// ---- Slugs ---------------------------------------------------------------------

// Slugs become part of a URL and a Cloudinary folder: lower-case ASCII only.
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;

export const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
