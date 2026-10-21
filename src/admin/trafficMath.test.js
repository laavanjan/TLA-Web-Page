import {
  ymdIn,
  addDays,
  rangeDates,
  totals,
  dailySeries,
  bucketSeries,
  weekHourGrid,
  ranked,
  change,
  toCsv,
  dailyCsv,
} from "./trafficMath";

const ROWS = [
  {
    day: "2026-10-19",
    visitors: 10,
    new_visitors: 6,
    sessions: 12,
    views: 30,
    bounces: 3,
    sources: { google: 6, instagram: 4 },
    pages: { "/": 20, "/books": 10 },
    titles: { "/books": "Books" },
    hours: { 9: 10, 20: 20 },
  },
  {
    day: "2026-10-21",
    visitors: 5,
    new_visitors: 5,
    sessions: 6,
    views: 9,
    bounces: 3,
    sources: { instagram: 5 },
    pages: { "/": 9 },
    hours: { 20: 9 },
  },
];

test("days are Sri Lanka days", () => {
  // 20:00 UTC is already the next morning in Colombo.
  expect(ymdIn(new Date("2026-10-19T20:00:00Z"))).toBe("2026-10-20");
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
});

test("a range and the one before it are the same length", () => {
  const r = rangeDates("7d", new Date("2026-10-19T06:00:00Z"));
  expect(r).toEqual({ from: "2026-10-13", to: "2026-10-19", prevFrom: "2026-10-06", prevTo: "2026-10-12", days: 7 });
  expect(rangeDates("today", new Date("2026-10-19T06:00:00Z"))).toMatchObject({ from: "2026-10-19", prevFrom: "2026-10-18" });
});

test("totals add up the days and their breakdowns", () => {
  const t = totals(ROWS);
  expect(t).toMatchObject({ visitors: 15, newVisitors: 11, returning: 4, sessions: 18, views: 39, bounces: 6 });
  expect(t.sources).toEqual({ google: 6, instagram: 9 });
  expect(t.pages).toEqual({ "/": 29, "/books": 10 });
  expect(t.bounceRate).toBeCloseTo(6 / 18);
  expect(totals([])).toMatchObject({ visitors: 0, bounceRate: 0, pagesPerVisit: 0 });
});

test("the chart has a point for every day, zero when nobody came", () => {
  const s = dailySeries(ROWS, "2026-10-19", "2026-10-21");
  expect(s.map((p) => p.visitors)).toEqual([10, 0, 5]);
});

test("a year is shown by month", () => {
  const long = dailySeries(ROWS, "2025-10-22", "2026-10-21");
  const b = bucketSeries(long);
  expect(b.unit).toBe("month");
  expect(b.points[b.points.length - 1]).toMatchObject({ day: "2026-10-01", visitors: 15 });
  expect(bucketSeries(dailySeries(ROWS, "2026-10-19", "2026-10-21")).unit).toBe("day");
});

test("the weekday × hour grid starts on Monday", () => {
  const g = weekHourGrid(ROWS);
  // 19 Oct 2026 is a Monday, 21 Oct a Wednesday.
  expect(g[0][9]).toBe(10);
  expect(g[0][20]).toBe(20);
  expect(g[2][20]).toBe(9);
});

test("ranking folds the long tail into other", () => {
  expect(ranked({ a: 1, b: 5, c: 3, d: 0 })).toEqual([["b", 5], ["c", 3], ["a", 1]]);
  expect(ranked({ a: 1, b: 5, c: 3 }, 1, "other")).toEqual([["b", 5], ["other", 4]]);
});

test("change compares with the previous range", () => {
  expect(change(15, 10)).toBeCloseTo(0.5);
  expect(change(5, 10)).toBeCloseTo(-0.5);
  expect(change(5, 0)).toBe(null);
  expect(change(0, 0)).toBe(0);
});

test("the CSV is safe to open in Excel", () => {
  expect(toCsv(["a", "b"], [["=SUM(A1)", 'say "hi", ok']])).toBe('a,b\r\n\'=SUM(A1),"say ""hi"", ok"');
  const csv = dailyCsv(ROWS, "2026-10-19", "2026-10-20").split("\r\n");
  expect(csv).toHaveLength(3);
  expect(csv[1]).toBe("2026-10-19,10,6,4,12,30,25,google,/");
  expect(csv[2]).toBe("2026-10-20,0,0,0,0,0,0,,");
});
