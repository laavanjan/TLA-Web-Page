// Anonymous ids for counting visits. Nothing here identifies a person:
//   visitor id ... random, replaced every day, so a visitor counts once a
//                  day but can't be followed from one day to the next
//   returning .... only "has this browser been here on an earlier day?"
//   session ...... random, ends after 30 minutes without a page view; it also
//                  remembers where the visit started, so every page in the
//                  visit is credited to that source
// Everything is stored in the browser only, and every read is guarded, so a
// private window or blocked storage just means the visit counts as new.

const VISITOR_KEY = "tla_av";
const FIRST_SEEN_KEY = "tla_af";
const SESSION_KEY = "tla_as";
const SESSION_IDLE = 30 * 60 * 1000;

export function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const today = (now) => {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const read = (store, key) => {
  try {
    const raw = store && store.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const write = (store, key, value) => {
  try {
    if (store) store.setItem(key, JSON.stringify(value));
  } catch (e) {
    // storage blocked: fine, the visit just won't be linked up
  }
};

// { id, returning } for today.
export function dailyVisitor(store, now = Date.now()) {
  const day = today(now);
  const firstSeen = read(store, FIRST_SEEN_KEY);
  if (!firstSeen) write(store, FIRST_SEEN_KEY, day);
  const returning = !!firstSeen && firstSeen < day;

  const saved = read(store, VISITOR_KEY);
  if (saved && saved.day === day && saved.id) return { id: saved.id, returning };
  const id = uuid();
  write(store, VISITOR_KEY, { day, id });
  return { id, returning };
}

// { id, isNew, landing } — landing is whatever was passed in when the session
// started (the source of the visit), kept for the rest of it.
export function currentSession(store, landing, now = Date.now()) {
  const saved = read(store, SESSION_KEY);
  if (saved && saved.id && now - saved.last < SESSION_IDLE) {
    write(store, SESSION_KEY, { ...saved, last: now });
    return { id: saved.id, isNew: false, landing: saved.landing };
  }
  const fresh = { id: uuid(), last: now, landing };
  write(store, SESSION_KEY, fresh);
  return { id: fresh.id, isNew: true, landing };
}

// The browser asked not to be tracked (Do Not Track or Global Privacy Control).
export function optedOut(nav = {}, win = {}) {
  return nav.doNotTrack === "1" || nav.doNotTrack === "yes" || win.doNotTrack === "1" || nav.globalPrivacyControl === true;
}
