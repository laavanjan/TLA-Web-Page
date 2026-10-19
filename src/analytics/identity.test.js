import { dailyVisitor, currentSession, optedOut, uuid } from "./identity";

const memoryStore = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
};

const DAY1 = new Date(2026, 9, 19, 10).getTime();
const DAY2 = new Date(2026, 9, 20, 9).getTime();

test("ids look like uuids", () => {
  expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("the visitor id stays the same all day and changes the next day", () => {
  const store = memoryStore();
  const first = dailyVisitor(store, DAY1);
  expect(first.returning).toBe(false);
  expect(dailyVisitor(store, DAY1 + 3600e3)).toEqual(first);
  const next = dailyVisitor(store, DAY2);
  expect(next.id).not.toBe(first.id);
  expect(next.returning).toBe(true);
});

test("blocked storage still gives an id, counted as a new visitor", () => {
  const broken = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  };
  expect(dailyVisitor(broken, DAY1)).toMatchObject({ returning: false });
  expect(dailyVisitor(null, DAY1).id).toBeTruthy();
});

test("a session keeps its landing source until 30 idle minutes", () => {
  const store = memoryStore();
  const s1 = currentSession(store, "instagram", DAY1);
  expect(s1).toMatchObject({ isNew: true, landing: "instagram" });
  const s2 = currentSession(store, "direct", DAY1 + 20 * 60e3);
  expect(s2).toMatchObject({ id: s1.id, isNew: false, landing: "instagram" });
  const s3 = currentSession(store, "google", DAY1 + 55 * 60e3);
  expect(s3).toMatchObject({ isNew: true, landing: "google" });
  expect(s3.id).not.toBe(s1.id);
});

test("Do Not Track and Global Privacy Control are respected", () => {
  expect(optedOut({ doNotTrack: "1" })).toBe(true);
  expect(optedOut({ globalPrivacyControl: true })).toBe(true);
  expect(optedOut({}, { doNotTrack: "1" })).toBe(true);
  expect(optedOut({ doNotTrack: "0" })).toBe(false);
  expect(optedOut({ doNotTrack: "unspecified" })).toBe(false);
});
