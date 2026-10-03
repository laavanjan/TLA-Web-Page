// Turns two versions of an event page (as stored in event_pages.data) into a
// short, plain-English list of what changed - used by the Activity log. The
// event counterpart of pageDiff.js.
import { EVENT_SECTION_META } from "../Components/events/eventSectionMeta";
import { EVENT_CATEGORIES } from "./eventSections";
import { plural, match, same, quoteList, countChange } from "./pageDiff";

const sectionName = (s) => `"${s.title || (EVENT_SECTION_META[s.type] || {}).label || s.type}"`;
const categoryTitle = (id) => (EVENT_CATEGORIES.find((c) => c.id === id) || {}).title || id;
const clean = (v) => (v == null ? "" : String(v));
const differs = (a, b) => clean(a) !== clean(b);

// How each kind of row is named in the log.
const NAME = {
  agenda: (x) => x.title || x.time,
  awards: (x) => [x.place, x.name].filter(Boolean).join(" ") || x.detail,
  rules: (x) => x.text,
  cards: (x) => x.title,
  competitions: (x) => x.name,
  sponsors: (x) => x.name || x.tier,
  contacts: (x) => x.name,
  facts: (x) => x.label,
  editions: (x) => x.year,
  timeline: (x) => x.text || x.year,
};

const NOUN = {
  agenda: ["programme item"],
  awards: ["winner / prize", "winners / prizes"],
  rules: ["rule"],
  cards: ["card"],
  competitions: ["competition"],
  sponsors: ["sponsor"],
  contacts: ["contact"],
  facts: ["detail"],
  editions: ["year", "years"],
  timeline: ["entry", "entries"],
};

function itemLines(type, before, after) {
  const m = match(before, after, (x) => x.id);
  const name = NAME[type];
  const out = [];
  const short = (x) => String(name(x) || "").slice(0, 40);
  if (m.added.length) out.push(`added ${quoteList(m.added.map(short).filter(Boolean)) || plural(m.added.length, ...NOUN[type])}`);
  if (m.removed.length) out.push(`removed ${quoteList(m.removed.map(short).filter(Boolean)) || plural(m.removed.length, ...NOUN[type])}`);
  const edited = m.both.filter(([x, y]) => !same(x, y));
  if (edited.length) out.push(`edited ${edited.length <= 3 ? quoteList(edited.map(([, y]) => short(y)).filter(Boolean)) || plural(edited.length, ...NOUN[type]) : plural(edited.length, ...NOUN[type])}`);
  const order = (list) => list.filter((x) => m.both.some(([, y]) => y.id === x.id)).map((x) => x.id);
  if (!same(order(before), order(after))) out.push("reordered them");
  return out;
}

const photoLines = (before = [], after = []) => {
  const m = match(before, after, (x) => x.url);
  const out = countChange(m, "photo");
  const captions = m.both.filter(([x, y]) => clean(x.caption) !== clean(y.caption)).length;
  if (captions) out.push(`changed ${plural(captions, "caption")}`);
  const order = (list) => list.filter((x) => m.both.some(([, y]) => y.url === x.url)).map((x) => x.url);
  if (!same(order(before), order(after))) out.push("reordered photos");
  return out;
};

function sectionChanges(b, a) {
  const out = [];
  switch (a.type) {
    case "intro": {
      if (differs(b.text, a.text)) out.push("edited the text");
      if (differs(b.image, a.image)) out.push("changed the illustration");
      if (differs(b.date, a.date)) out.push("changed the date");
      if (differs(b.venue, a.venue)) out.push("changed the venue");
      if (differs(b.buttonUrl, a.buttonUrl) || differs(b.buttonLabel, a.buttonLabel)) out.push("changed the button");
      break;
    }
    case "text":
      if (differs(b.text, a.text)) out.push("edited the text");
      if (differs(b.buttonUrl, a.buttonUrl) || differs(b.buttonLabel, a.buttonLabel)) out.push("changed the button");
      break;
    case "agenda": {
      if (differs(b.lead, a.lead) || differs(b.heading, a.heading)) out.push("changed the invitation title");
      if (differs(b.date, a.date)) out.push("changed the date");
      if (differs(b.time, a.time)) out.push("changed the time");
      if (differs(b.venue, a.venue)) out.push("changed the venue");
      out.push(...itemLines("agenda", b.items, a.items));
      out.push(...photoLines(b.images, a.images).map((l) => `${l} (posters)`));
      break;
    }
    case "gallery":
      out.push(...photoLines(b.images, a.images));
      break;
    case "rules":
      if (!!b.collapsible !== !!a.collapsible) out.push(a.collapsible ? "put the rules behind a button" : "showed the rules directly");
      out.push(...itemLines("rules", b.items, a.items));
      break;
    case "contacts":
    case "facts":
      if (differs(b.note, a.note)) out.push("edited the extra line");
      out.push(...itemLines(a.type, b.items, a.items));
      break;
    case "awards":
    case "cards":
    case "competitions":
    case "sponsors":
    case "editions":
    case "timeline":
      out.push(...itemLines(a.type, b.items, a.items));
      break;
    case "youtube":
      out.push(...countChange(match(b.links, a.links, (u) => u), "video"));
      break;
    case "instagram":
      out.push(...countChange(match(b.links, a.links, (u) => u), "post"));
      break;
    case "live":
      if (b.block !== a.block) out.push("switched the built-in block");
      break;
    default:
      if (!same(b, a)) out.push("edited it");
  }
  return out;
}

export function summarizeEventChange(before, after) {
  if (!after) return [];
  if (!before) return ["Published the page for the first time"];
  const out = [];

  if (differs(before.title, after.title)) out.push(`Renamed the event to "${after.title}"`);
  if (differs(before.summary, after.summary)) out.push("Edited the card text");
  if (differs(before.image, after.image)) {
    out.push(!before.image ? "Added the card illustration" : !after.image ? "Removed the card illustration" : "Replaced the card illustration");
  }
  if (differs(before.category, after.category)) out.push(`Moved it to "${categoryTitle(after.category)}" on the home page`);

  const sec = match(before.sections, after.sections, (s) => s.id);
  sec.added.forEach((s) => out.push(`Added the ${sectionName(s)} section`));
  sec.removed.forEach((s) => out.push(`Removed the ${sectionName(s)} section`));
  sec.both.forEach(([b, a]) => {
    if (differs(b.title, a.title)) out.push(`Renamed section ${sectionName(b)} to ${sectionName(a)}`);
    if (!!b.hidden !== !!a.hidden) out.push(`${a.hidden ? "Hid" : "Showed"} the ${sectionName(a)} section`);
    const inner = sectionChanges(b, a);
    if (inner.length) out.push(`${sectionName(a)}: ${inner.join(", ")}`);
  });
  const order = (list) => list.filter((s) => sec.both.some(([, a]) => a.id === s.id)).map((s) => s.id);
  if (!same(order(before.sections || []), order(after.sections || []))) out.push("Reordered the sections");

  return out.length ? out : ["Published with no visible changes"];
}

// The home page cards: which events are shown, and in what order.
export function summarizeLayoutChange(before, after, titleOf) {
  if (!after) return [];
  const out = [];
  const hid = new Set((before && before.hidden) || []);
  const now = new Set(after.hidden || []);
  [...now].filter((id) => !hid.has(id)).forEach((id) => out.push(`Hid "${titleOf(id)}" from the home page`));
  [...hid].filter((id) => !now.has(id)).forEach((id) => out.push(`Showed "${titleOf(id)}" on the home page`));
  if (!before || !same(before.order || [], after.order || [])) out.push("Changed the order of the home page cards");
  return out.length ? out : ["Published with no visible changes"];
}
