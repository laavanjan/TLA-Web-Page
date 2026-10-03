import { BUILTIN_EVENTS, builtInPage, isBuiltIn, RESERVED_SLUGS } from "../Components/events/eventsRegistry";
import { sanitizeEventPage, blankSection, blankEventPage, slugify, SLUG_RE, EVENT_SECTION_TYPES, LIVE_BLOCKS } from "./eventSections";
import { homeGroups, groupsWithHidden, sanitizeLayout, hiddenIds, eventPublicIds } from "./eventPages";
import { summarizeEventChange, summarizeLayoutChange } from "./eventPageDiff";
import { uploadedImage, imageSource, imageCandidates, safeImage } from "./mediaLinks";

// What the site shows before anyone has published anything.
const defaults = () =>
  BUILTIN_EVENTS.map((e, i) => ({ id: e.id, builtIn: true, parent: e.parent || null, path: e.path, updatedAt: null, ...builtInPage(e.id), _i: i }));

describe("built-in event pages", () => {
  test("there are 13 events plus the four Brammam competition pages", () => {
    expect(BUILTIN_EVENTS.filter((e) => !e.parent)).toHaveLength(13);
    expect(BUILTIN_EVENTS.filter((e) => e.parent === "brammam")).toHaveLength(4);
  });

  test.each(BUILTIN_EVENTS.map((e) => e.id))("%s survives being published unchanged", (id) => {
    const page = builtInPage(id);
    expect(sanitizeEventPage(page, builtInPage(id))).toEqual(page);
  });

  test.each(BUILTIN_EVENTS.map((e) => e.id))("%s has unique section ids and only known section types", (id) => {
    const { sections } = builtInPage(id);
    expect(new Set(sections.map((s) => s.id)).size).toBe(sections.length);
    sections.forEach((s) => expect(EVENT_SECTION_TYPES).toContain(s.type));
  });

  test("every built-in image reference resolves", () => {
    BUILTIN_EVENTS.forEach((e) => {
      const page = builtInPage(e.id);
      expect(imageSource(page.image)).toBe("bundled");
      page.sections.forEach((s) => {
        (s.items || []).forEach((it) => {
          [it.image, it.logo, it.poster].filter(Boolean).forEach((u) => expect(imageCandidates(u).length).toBeGreaterThan(0));
        });
      });
    });
  });

  test("addresses are valid and don't collide", () => {
    const ids = BUILTIN_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(SLUG_RE.test(id)).toBe(true));
    expect(RESERVED_SLUGS).toEqual(expect.arrayContaining(["thaipongal", "brammam", "comingsoon"]));
    expect(isBuiltIn("ppl")).toBe(true);
    expect(isBuiltIn("my-new-event")).toBe(false);
  });
});

describe("cleaning an event page", () => {
  const page = (sections) => ({ title: "T", summary: "", image: "", category: "culture", sections });

  test("drops unknown sections and unknown built-in blocks", () => {
    const out = sanitizeEventPage(
      page([{ type: "evil", id: "x" }, { ...blankSection("live"), block: "nope" }, { ...blankSection("live"), block: LIVE_BLOCKS[0] }]),
      null
    );
    expect(out.sections.map((s) => s.type)).toEqual(["live"]);
  });

  test("keeps https links and bundled image keys, drops everything else", () => {
    const out = sanitizeEventPage(
      page([
        { ...blankSection("awards"), items: [
          { id: "a", name: "ok", image: "asset:ppl/first" },
          { id: "b", name: "web", image: "https://example.com/a.png" },
          // eslint-disable-next-line no-script-url
          { id: "c", name: "js", image: "javascript:alert(1)" },
        ] },
      ]),
      null
    );
    expect(out.sections[0].items.map((i) => i.image)).toEqual(["asset:ppl/first", "https://example.com/a.png", ""]);
    expect(safeImage("data:image/png;base64,AAAA")).toBe("");
  });

  test("buttons may point at this site but not at another one through //", () => {
    const out = sanitizeEventPage(
      page([
        { ...blankSection("cards"), items: [
          { id: "1", title: "in-site", url: "/events/ppl" },
          { id: "2", title: "protocol-relative", url: "//evil.example/x" },
          // eslint-disable-next-line no-script-url
          { id: "3", title: "script", url: "javascript:alert(1)" },
          { id: "4", title: "external", url: "https://example.org/x" },
        ] },
      ]),
      null
    );
    expect(out.sections[0].items.map((i) => i.url)).toEqual(["/events/ppl", "", "", "https://example.org/x"]);
  });

  test("drops rows with nothing in them and keeps rule order", () => {
    const out = sanitizeEventPage(
      page([
        { ...blankSection("rules"), items: [{ id: "1", text: "first" }, { id: "2", text: "  " }, { id: "3", text: "third" }] },
        { ...blankSection("contacts"), items: [{ id: "x", name: "", phone: "", email: "" }] },
      ]),
      null
    );
    expect(out.sections[0].items.map((r) => r.text)).toEqual(["first", "third"]);
    expect(out.sections[1].items).toEqual([]);
  });

  test("falls back to the built-in page when there is nothing valid saved", () => {
    expect(sanitizeEventPage({}, builtInPage("ppl"))).toEqual(builtInPage("ppl"));
    expect(sanitizeEventPage(null, null).sections).toHaveLength(1);
  });

  test("a blank new event starts with an introduction", () => {
    const blank = blankEventPage("Hello", "social");
    expect(blank.sections.map((s) => s.type)).toEqual(["intro"]);
    expect(blank.category).toBe("social");
  });

  test("slugs", () => {
    expect(slugify("Tamil Vizha 2026!")).toBe("tamil-vizha-2026");
    expect(slugify("தமிழ் விழா")).toBe("");
    expect(SLUG_RE.test("tamil-vizha-2026")).toBe(true);
    expect(SLUG_RE.test("-bad")).toBe(false);
    expect(SLUG_RE.test("a")).toBe(false);
  });
});

describe("home page cards", () => {
  test("by default: 12 cards in the old order, food festival and sub-pages left out", () => {
    const groups = homeGroups(defaults(), sanitizeLayout(null));
    expect(groups.map((g) => g.category.id)).toEqual(["culture", "competition", "guidance", "social", "carnival"]);
    expect(groups.flatMap((g) => g.cards.map((c) => c.id))).toEqual([
      "thaipongal", "vani-villa", "thamilaruvi",
      "sotkanai", "ideathon", "brammam",
      "aramiyam",
      "jeevanathi", "kovil", "blood-donation",
      "ppl", "movie-night",
    ]);
  });

  test("a saved layout reorders and hides cards", () => {
    const layout = sanitizeLayout({ order: ["vani-villa", "thaipongal"], hidden: ["kovil", "food-festival"] });
    const groups = homeGroups(defaults(), layout);
    expect(groups[0].cards.map((c) => c.id)).toEqual(["vani-villa", "thaipongal", "thamilaruvi"]);
    expect(groups.find((g) => g.category.id === "social").cards.map((c) => c.id)).toEqual(["jeevanathi", "blood-donation"]);
  });

  test("showing the food festival puts it in its group; hidden ones stay in the admin list", () => {
    const layout = sanitizeLayout({ order: [], hidden: [] });
    expect(homeGroups(defaults(), layout).find((g) => g.category.id === "carnival").cards.map((c) => c.id)).toContain("food-festival");
    expect(groupsWithHidden(defaults(), sanitizeLayout(null)).find((g) => g.category.id === "carnival").cards.map((c) => c.id)).toContain(
      "food-festival"
    );
  });

  test("a layout that was never saved falls back to each event's own default", () => {
    expect(hiddenIds(sanitizeLayout(null))).toEqual(["food-festival"]);
    expect(hiddenIds(sanitizeLayout({ order: [], hidden: [] }))).toEqual([]);
  });

  test("an event the admin created appears at the end of its group", () => {
    const pages = [...defaults(), { id: "new-fest", builtIn: false, parent: null, title: "New", category: "culture", sections: [] }];
    const culture = homeGroups(pages, sanitizeLayout(null))[0].cards.map((c) => c.id);
    expect(culture).toEqual(["thaipongal", "vani-villa", "thamilaruvi", "new-fest"]);
  });

  test("layout ids that aren't events are ignored", () => {
    expect(sanitizeLayout({ order: ["ppl", "NOT VALID", 7, "ppl"], hidden: ["../x"] })).toEqual({ order: ["ppl"], hidden: [] });
  });
});

describe("uploads", () => {
  const cloud = (path) => `https://res.cloudinary.com/demo/image/upload/v123/${path}.jpg`;

  test("event photos are recognised by their folder", () => {
    expect(uploadedImage(cloud("tla/events/ppl/abcdefgh1234"))).toEqual({ publicId: "tla/events/ppl/abcdefgh1234", teamId: null, eventId: "ppl" });
    expect(uploadedImage(cloud("tla/teams/2/abcdefgh1234"))).toEqual({ publicId: "tla/teams/2/abcdefgh1234", teamId: 2, eventId: null });
    expect(uploadedImage(cloud("somewhere/else/abcdefgh1234"))).toBeNull();
  });

  test("only this event's own photos are ever deleted", () => {
    const page = {
      id: "ppl",
      image: cloud("tla/events/ppl/aaaaaaaa1111"),
      sections: [
        { type: "gallery", images: [{ url: cloud("tla/events/ppl/bbbbbbbb2222") }, { url: cloud("tla/events/kovil/cccccccc3333") }, { url: cloud("tla/teams/1/dddddddd4444") }] },
        { type: "cards", items: [{ image: "", images: [{ url: cloud("tla/events/ppl/eeeeeeee5555") }] }] },
      ],
    };
    expect([...eventPublicIds(page)].sort()).toEqual(["tla/events/ppl/aaaaaaaa1111", "tla/events/ppl/bbbbbbbb2222", "tla/events/ppl/eeeeeeee5555"]);
  });
});

describe("activity summaries", () => {
  const base = () => builtInPage("thamilaruvi");

  test("first publish", () => {
    expect(summarizeEventChange(null, base())).toEqual(["Published the page for the first time"]);
  });

  test("describes what changed in plain words", () => {
    const before = base();
    const after = JSON.parse(JSON.stringify(before));
    after.title = "தமிழருவி 2026";
    after.sections.find((s) => s.type === "agenda").date = "01.01.2026";
    after.sections.find((s) => s.type === "agenda").items.pop();
    after.sections.find((s) => s.type === "gallery").hidden = true;
    const lines = summarizeEventChange(before, after);
    expect(lines).toEqual(
      expect.arrayContaining([
        'Renamed the event to "தமிழருவி 2026"',
        'Hid the "கலை காட்சி கூடம்" section',
      ])
    );
    expect(lines.join(" ")).toMatch(/changed the date/);
    expect(lines.join(" ")).toMatch(/removed/);
  });

  test("no visible change", () => {
    expect(summarizeEventChange(base(), base())).toEqual(["Published with no visible changes"]);
  });

  test("home page layout changes", () => {
    const title = (id) => id.toUpperCase();
    const lines = summarizeLayoutChange({ order: ["a", "b"], hidden: [] }, { order: ["b", "a"], hidden: ["kovil"] }, title);
    expect(lines).toEqual(['Hid "KOVIL" from the home page', "Changed the order of the home page cards"]);
  });
});
