// Turning the daily rows from analytics_daily into what the Traffic page
// shows: totals for a range, the chart series, the weekday × hour grid and
// the CSV export. Days are Sri Lanka days, the same as the database.

const ZONE = "Asia/Colombo";
const DAY = 24 * 3600 * 1000;

// "2026-10-19" for a moment, in Sri Lanka time.
export function ymdIn(date, zone = ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

const toDate = (ymd) => new Date(`${ymd}T00:00:00Z`);
export const addDays = (ymd, n) => new Date(toDate(ymd).getTime() + n * DAY).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / DAY);

export const RANGES = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "12m", label: "12 months", days: 365 },
];

// { from, to, prevFrom, prevTo, days } — the previous range is the same
// length, just before, so the arrows compare like with like.
export function rangeDates(id, now = new Date()) {
  const range = RANGES.find((r) => r.id === id) || RANGES[2];
  const to = ymdIn(now);
  const from = addDays(to, -(range.days - 1));
  return { from, to, prevFrom: addDays(from, -range.days), prevTo: addDays(from, -1), days: range.days };
}

const addInto = (target, map) => {
  Object.entries(map || {}).forEach(([k, v]) => {
    target[k] = (target[k] || 0) + (Number(v) || 0);
  });
  return target;
};

// All the rows in a range added up.
export function totals(rows) {
  const t = {
    visitors: 0,
    newVisitors: 0,
    sessions: 0,
    views: 0,
    bounces: 0,
    sources: {},
    pages: {},
    titles: {},
    devices: {},
    browsers: {},
    countries: {},
    campaigns: {},
    referrers: {},
    events: {},
  };
  rows.forEach((r) => {
    t.visitors += r.visitors || 0;
    t.newVisitors += r.new_visitors || 0;
    t.sessions += r.sessions || 0;
    t.views += r.views || 0;
    t.bounces += r.bounces || 0;
    ["sources", "pages", "devices", "browsers", "countries", "campaigns", "referrers", "events"].forEach((k) => addInto(t[k], r[k]));
    Object.assign(t.titles, r.titles || {});
  });
  t.returning = Math.max(0, t.visitors - t.newVisitors);
  t.bounceRate = t.sessions ? t.bounces / t.sessions : 0;
  t.pagesPerVisit = t.sessions ? t.views / t.sessions : 0;
  return t;
}

// One entry per day from..to, with zeros for days nobody came.
export function dailySeries(rows, from, to) {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const r = byDay.get(d) || {};
    out.push({ day: d, visitors: r.visitors || 0, views: r.views || 0, sessions: r.sessions || 0 });
  }
  return out;
}

// Long ranges read better as weeks or months than as 365 thin points.
export function bucketSeries(series) {
  if (series.length <= 92) return { unit: "day", points: series };
  const byMonth = new Map();
  series.forEach((p) => {
    const key = p.day.slice(0, 7);
    const m = byMonth.get(key) || { day: `${key}-01`, visitors: 0, views: 0, sessions: 0 };
    m.visitors += p.visitors;
    m.views += p.views;
    m.sessions += p.sessions;
    byMonth.set(key, m);
  });
  return { unit: "month", points: [...byMonth.values()] };
}

// grid[weekday 0 = Monday][hour] = page views.
export function weekHourGrid(rows) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  rows.forEach((r) => {
    const weekday = (toDate(r.day).getUTCDay() + 6) % 7;
    Object.entries(r.hours || {}).forEach(([h, n]) => {
      const hour = Number(h);
      if (hour >= 0 && hour < 24) grid[weekday][hour] += Number(n) || 0;
    });
  });
  return grid;
}

// [[key, n], ...] biggest first; anything past `limit` is folded into "other".
export function ranked(map, limit = Infinity, otherKey = "") {
  const list = Object.entries(map || {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (list.length <= limit) return list;
  const kept = list.slice(0, limit);
  const rest = list.slice(limit).reduce((s, [, n]) => s + n, 0);
  return otherKey ? [...kept, [otherKey, rest]] : kept;
}

// Change from the previous range as a fraction (0.25 = up 25%), or null
// when there is nothing to compare against.
export function change(now, before) {
  if (!before) return now ? null : 0;
  return (now - before) / before;
}

const csvCell = (v) => {
  const s = String(v === null || v === undefined ? "" : v);
  // Stop spreadsheet apps from running a cell as a formula.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function toCsv(header, rows) {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export function dailyCsv(rows, from, to) {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const r = byDay.get(d) || {};
    const top = (map) => (ranked(map, 1)[0] || [""])[0];
    out.push([
      d,
      r.visitors || 0,
      r.new_visitors || 0,
      Math.max(0, (r.visitors || 0) - (r.new_visitors || 0)),
      r.sessions || 0,
      r.views || 0,
      r.sessions ? Math.round(((r.bounces || 0) / r.sessions) * 100) : 0,
      top(r.sources),
      top(r.pages),
    ]);
  }
  return toCsv(
    ["Date", "Visitors", "New visitors", "Returning visitors", "Visits", "Page views", "Left after one page (%)", "Top source", "Top page"],
    out
  );
}
