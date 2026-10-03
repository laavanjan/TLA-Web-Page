// Turns two versions of a team page (as stored in team_pages.data) into a
// short, plain-English list of what changed - used by the Activity log.
import { SECTION_META } from "../Components/teams/sectionMeta";
import { upgradeSections } from "./teamPages";

const plural = (k, word, many = `${word}s`) => `${k} ${k === 1 ? word : many}`;
const sectionName = (s) => `"${s.title || (SECTION_META[s.type] || {}).label || s.type}"`;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// { added, removed, both: [[before, after], ...] } matched by key(item).
function match(before = [], after = [], key) {
  const b = new Map(before.map((x) => [key(x), x]));
  const a = new Map(after.map((x) => [key(x), x]));
  return {
    added: after.filter((x) => !b.has(key(x))),
    removed: before.filter((x) => !a.has(key(x))),
    both: after.filter((x) => b.has(key(x))).map((x) => [b.get(key(x)), x]),
  };
}

const imageOf = (x) => (typeof x === "string" ? { url: x, caption: "" } : x || {});
const quoteList = (names, max = 3) => {
  const shown = names.slice(0, max).map((n) => `"${n}"`).join(", ");
  return names.length > max ? `${shown} and ${names.length - max} more` : shown;
};

function countChange(m, noun, many) {
  const out = [];
  if (m.added.length) out.push(`added ${plural(m.added.length, noun, many)}`);
  if (m.removed.length) out.push(`removed ${plural(m.removed.length, noun, many)}`);
  return out;
}

// What changed inside one section, as lower-case phrases.
function sectionChanges(b, a) {
  const out = [];
  switch (a.type) {
    case "text":
      if ((b.text || "") !== (a.text || "")) out.push("edited the text");
      if ((b.buttonUrl || "") !== (a.buttonUrl || "") || (b.buttonLabel || "") !== (a.buttonLabel || "")) {
        out.push("changed the button");
      }
      break;
    case "years": {
      const m = match(b.years, a.years, (y) => y.year);
      if (m.added.length) out.push(`added ${m.added.map((y) => y.year).join(", ")}`);
      if (m.removed.length) out.push(`removed ${m.removed.map((y) => y.year).join(", ")}`);
      m.both.forEach(([x, y]) => {
        const parts = [];
        const p = match(x.people, y.people, (q) => q.id);
        if (p.added.length) parts.push(`added ${quoteList(p.added.map((q) => q.name))}`);
        if (p.removed.length) parts.push(`removed ${quoteList(p.removed.map((q) => q.name))}`);
        const edited = p.both.filter(([u, v]) => !same(u, v)).map(([, v]) => v.name);
        if (edited.length) parts.push(`updated ${quoteList(edited)}`);
        parts.push(...countChange(match(x.members, y.members, (n) => n), "member"));
        if (parts.length) out.push(`${y.year} (${parts.join(", ")})`);
      });
      break;
    }
    case "people": {
      const m = match(b.people, a.people, (p) => p.id);
      if (m.added.length) out.push(`added ${quoteList(m.added.map((p) => p.name))}`);
      if (m.removed.length) out.push(`removed ${quoteList(m.removed.map((p) => p.name))}`);
      const edited = m.both.filter(([x, y]) => !same(x, y)).map(([, y]) => y.name);
      if (edited.length) out.push(`updated ${quoteList(edited)}`);
      break;
    }
    case "timeline": {
      const m = match(b.items, a.items, (t) => t.id);
      out.push(...countChange(m, "entry", "entries"));
      const edited = m.both.filter(([x, y]) => !same(x, y)).length;
      if (edited) out.push(`edited ${plural(edited, "entry", "entries")}`);
      break;
    }
    case "members": {
      const m = match(b.names, a.names, (n) => n);
      if (m.added.length) out.push(`added ${quoteList(m.added)}`);
      if (m.removed.length) out.push(`removed ${quoteList(m.removed)}`);
      break;
    }
    case "youtube":
      out.push(...countChange(match(b.links, a.links, (u) => u), "video"));
      break;
    case "instagram":
      out.push(...countChange(match(b.links, a.links, (u) => u), "post"));
      break;
    case "competitions": {
      const m = match(b.items, a.items, (c) => c.id);
      if (m.added.length) out.push(`added ${quoteList(m.added.map((c) => c.name))}`);
      if (m.removed.length) out.push(`removed ${quoteList(m.removed.map((c) => c.name))}`);
      const edited = m.both.filter(([x, y]) => !same(x, y)).map(([, y]) => y.name);
      if (edited.length) out.push(`updated ${quoteList(edited)}`);
      break;
    }
    case "gallery": {
      const bi = (b.images || []).map(imageOf);
      const ai = (a.images || []).map(imageOf);
      const m = match(bi, ai, (x) => x.url);
      out.push(...countChange(m, "photo"));
      const captions = m.both.filter(([x, y]) => (x.caption || "") !== (y.caption || "")).length;
      if (captions) out.push(`changed ${plural(captions, "caption")}`);
      const order = (list) => list.filter((x) => m.both.some(([, y]) => y.url === x.url)).map((x) => x.url);
      if (!same(order(bi), order(ai))) out.push("reordered photos");
      break;
    }
    default:
      if (!same(b, a)) out.push("edited it");
  }
  return out;
}

const IMAGE_FIELDS = [
  ["logo", "logo"],
  ["banner", "banner"],
  ["cover", "cover photo"],
];

// Older saved pages are upgraded first, so they compare like for like.
const upgraded = (page) => page && { ...page, sections: upgradeSections(page.sections || []) };

export function summarizePageChange(rawBefore, rawAfter) {
  const before = upgraded(rawBefore);
  const after = upgraded(rawAfter);
  if (!after) return [];
  if (!before) return ["Published the page for the first time"];
  const out = [];

  if ((before.title || "") !== (after.title || "")) out.push(`Renamed the team to "${after.title}"`);
  if ((before.tagline || "") !== (after.tagline || "")) out.push("Changed the tagline");
  if ((before.summary || "") !== (after.summary || "")) out.push("Edited the card summary on /teams");
  IMAGE_FIELDS.forEach(([key, name]) => {
    const was = before[key] || "";
    const now = after[key] || "";
    if (was === now) return;
    out.push(!was ? `Added the ${name}` : !now ? `Removed the ${name}` : `Replaced the ${name}`);
  });
  const socials = countChange(match(before.socials, after.socials, (u) => u), "social link");
  if (socials.length) out.push(socials.join(", ").replace(/^./, (c) => c.toUpperCase()));

  const sec = match(before.sections, after.sections, (s) => s.id);
  sec.added.forEach((s) => out.push(`Added the ${sectionName(s)} section`));
  sec.removed.forEach((s) => out.push(`Removed the ${sectionName(s)} section`));
  sec.both.forEach(([b, a]) => {
    if ((b.title || "") !== (a.title || "")) out.push(`Renamed section ${sectionName(b)} to ${sectionName(a)}`);
    if (!!b.hidden !== !!a.hidden) out.push(`${a.hidden ? "Hid" : "Showed"} the ${sectionName(a)} section`);
    const inner = sectionChanges(b, a);
    if (inner.length) out.push(`${sectionName(a)}: ${inner.join(", ")}`);
  });
  const order = (list) => list.filter((s) => sec.both.some(([, a]) => a.id === s.id)).map((s) => s.id);
  if (!same(order(before.sections || []), order(after.sections || []))) out.push("Reordered the sections");

  return out.length ? out : ["Published with no visible changes"];
}

// Shared with the event page summaries (eventPageDiff.js).
export { plural, match, same, quoteList, countChange };
