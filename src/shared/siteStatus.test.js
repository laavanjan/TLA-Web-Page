import { mergeStatus, isMaintenanceOn, gateView, summarizeStatusChange, DEFAULT_SITE_STATUS } from "./siteStatus";

const HOUR = 3600 * 1000;
const NOW = Date.parse("2026-10-12T10:00:00Z");
const later = (h) => new Date(NOW + h * HOUR).toISOString();

describe("cleaning the saved setting", () => {
  test("nothing saved means the site is open", () => {
    expect(mergeStatus(null)).toEqual(DEFAULT_SITE_STATUS);
    expect(mergeStatus({})).toEqual(DEFAULT_SITE_STATUS);
  });

  test("only a real true turns it on", () => {
    expect(mergeStatus({ enabled: true }).enabled).toBe(true);
    ["true", 1, "yes", null, undefined].forEach((v) => expect(mergeStatus({ enabled: v }).enabled).toBe(false));
  });

  test("text is trimmed and capped; a bad reopening time is dropped", () => {
    const out = mergeStatus({ enabled: true, title: "  Back soon  ", message: "x".repeat(5000), reopensAt: "not a date" });
    expect(out.title).toBe("Back soon");
    expect(out.message).toHaveLength(1000);
    expect(out.reopensAt).toBe("");
  });

  test("a reopening time is normalised to an ISO instant", () => {
    expect(mergeStatus({ reopensAt: "2026-10-12T15:30:00+05:30" }).reopensAt).toBe("2026-10-12T10:00:00.000Z");
  });
});

describe("is maintenance on", () => {
  test("off unless switched on", () => {
    expect(isMaintenanceOn({ ...DEFAULT_SITE_STATUS }, NOW)).toBe(false);
    expect(isMaintenanceOn(null, NOW)).toBe(false);
  });

  test("on with no reopening time stays on", () => {
    expect(isMaintenanceOn({ enabled: true, reopensAt: "" }, NOW)).toBe(true);
    expect(isMaintenanceOn({ enabled: true, reopensAt: "" }, NOW + 1000 * HOUR)).toBe(true);
  });

  test("the site reopens by itself once the time has passed", () => {
    const status = { enabled: true, reopensAt: later(2) };
    expect(isMaintenanceOn(status, NOW)).toBe(true);
    expect(isMaintenanceOn(status, NOW + 2 * HOUR - 1)).toBe(true);
    expect(isMaintenanceOn(status, NOW + 2 * HOUR)).toBe(false);
    expect(isMaintenanceOn(status, NOW + 5 * HOUR)).toBe(false);
  });

  test("a reopening time does nothing while the switch is off", () => {
    expect(isMaintenanceOn({ enabled: false, reopensAt: later(2) }, NOW)).toBe(false);
  });
});

describe("what the gate draws", () => {
  const view = (o) => gateView({ path: "/", ready: true, on: true, staff: "visitor", ...o });

  test("visitors get the maintenance page", () => {
    expect(view({})).toBe("maintenance");
    expect(view({ path: "/events/ppl" })).toBe("maintenance");
    expect(view({ path: "/frame" })).toBe("maintenance");
  });

  test("signed-in admins and editors see the site, with a banner", () => {
    expect(view({ staff: "staff" })).toBe("site-with-banner");
  });

  test("the admin area is never blocked, so it can always be switched off", () => {
    ["/admin", "/admin/login", "/admin/maintenance", "/admin/events"].forEach((path) => {
      expect(view({ path })).toBe("site");
      expect(view({ path, ready: false })).toBe("site");
    });
    expect(view({ path: "/administration" })).toBe("maintenance");
  });

  test("the site is shown when maintenance is off", () => {
    expect(view({ on: false })).toBe("site");
    expect(view({ on: false, staff: "idle" })).toBe("site");
  });

  test("a splash is shown while the setting or the sign-in is being checked, not the site or the maintenance page", () => {
    expect(view({ ready: false })).toBe("splash");
    expect(view({ staff: "checking" })).toBe("splash");
  });
});

describe("activity summaries", () => {
  test("turning it on with a reopening time", () => {
    const lines = summarizeStatusChange({}, { enabled: true, reopensAt: "2026-10-12T10:00:00Z" });
    expect(lines[0]).toBe("Visitors now see the maintenance page");
    expect(lines[1]).toMatch(/^Reopens /);
  });

  test("turning it off", () => {
    expect(summarizeStatusChange({ enabled: true }, { enabled: false })).toEqual(["The site is open to visitors again"]);
  });

  test("text and time changes while it stays on", () => {
    const before = { enabled: true, reopensAt: "2026-10-12T10:00:00Z", message: "a" };
    const after = { enabled: true, reopensAt: "", message: "b", title: "T" };
    expect(summarizeStatusChange(before, after)).toEqual([
      "No reopening time - stays closed until switched off",
      "Changed the heading",
      "Edited the message",
    ]);
  });

  test("nothing changed", () => {
    expect(summarizeStatusChange({ enabled: true }, { enabled: true })).toEqual(["Saved with no visible changes"]);
  });
});
