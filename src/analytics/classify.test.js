import { classifyVisit, cleanPath, sourceOfHost } from "./classify";

describe("where a visit came from", () => {
  test("no referrer and no tag is a direct visit", () => {
    expect(classifyVisit({}).source).toBe("direct");
  });

  test("known sites are recognised, with or without www or subdomains", () => {
    expect(sourceOfHost("google.com")).toBe("google");
    expect(sourceOfHost("google.lk")).toBe("google");
    expect(sourceOfHost("l.instagram.com")).toBe("instagram");
    expect(sourceOfHost("lm.facebook.com")).toBe("facebook");
    expect(sourceOfHost("t.co")).toBe("twitter");
    expect(sourceOfHost("example.org")).toBe("other");
  });

  test("the referring site's host is kept, but not the rest of the address", () => {
    const v = classifyVisit({ referrer: "https://www.google.com/search?q=tla" });
    expect(v).toMatchObject({ source: "google", referrerHost: "google.com" });
  });

  test("moving between our own pages is not a referral", () => {
    const v = classifyVisit({ referrer: "https://tlauom.com/books", ownHost: "www.tlauom.com" });
    expect(v).toMatchObject({ source: "direct", referrerHost: "" });
  });

  test("a utm tag wins over the referrer, and short names are understood", () => {
    expect(classifyVisit({ referrer: "https://google.com", search: "?utm_source=IG" }).source).toBe("instagram");
    expect(classifyVisit({ search: "?utm_source=qr&utm_campaign=Thamilaruvi-2026" })).toMatchObject({
      source: "qr",
      utm: { source: "qr", medium: "", campaign: "thamilaruvi-2026" },
    });
    expect(classifyVisit({ search: "?utm_source=tiktok.com" }).source).toBe("tiktok");
    expect(classifyVisit({ search: "?utm_source=College Fair!" }).source).toBe("collegefair");
  });
});

describe("cleaning the page address", () => {
  test("trailing slashes, queries and hashes are dropped", () => {
    expect(cleanPath("/books/")).toBe("/books");
    expect(cleanPath("/books?x=1#top")).toBe("/books");
    expect(cleanPath("/")).toBe("/");
    expect(cleanPath("")).toBe("/");
  });
});
