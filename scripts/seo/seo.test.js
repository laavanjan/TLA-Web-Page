// npm run test:seo
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildRoutes, bookImage } = require("./routes");
const { pageHtml, withVerification, headTags } = require("./html");
const { sitemapXml } = require("./sitemap");

const TEMPLATE =
  '<!doctype html><html lang="ta"><head><meta charset="utf-8"/><title>Home</title>' +
  '<meta name="description" content="home"/><meta property="og:title" content="home"/>' +
  '<meta property="og:image" content="https://tlauom.com/og/home.jpg"/><meta name="twitter:card" content="x"/>' +
  '<script type="application/ld+json">{"@type":"Organization"}</script></head><body><div id="root"></div></body></html>';

test("the fixed pages are all there, with the private ones marked noindex", () => {
  const r = buildRoutes();
  assert.ok(r["/"]);
  assert.equal(r["/events/thamilaruvi"].title, "தமிழருவி");
  assert.equal(r["/events/thamilaruvi"].image, "/og/thamilaruvi.jpg");
  assert.equal(r["/login"].noindex, true);
});

test("books, events and teams from the database are added or override", () => {
  const r = buildRoutes({
    books: [
      { slug: "tla26", title: "TLA 26", visibility: "unlisted", source: "drive", drive_file_id: "abc", updated_at: "2026-10-01T00:00:00Z" },
      { slug: "thamilaruvi26", title: "தமிழருவி'26", visibility: "listed", cover_url: "/images/books/c.webp" },
      { slug: "secret", title: "Hidden", visibility: "hidden" },
    ],
    events: [
      { id: "__layout", data: {} },
      { id: "thamilaruvi", data: { title: "தமிழருவி 2026", summary: "" }, updated_at: "2026-09-01T00:00:00Z" },
      { id: "kalai-vizha", data: { title: "கலை விழா", summary: "New event", image: "https://res.cloudinary.com/x.jpg" } },
      { id: "brammam-meerigai", data: { title: "மீரிகை" } },
    ],
    teams: [
      { id: 2, data: { hidden: true } },
      { id: 7, data: { title: "புதிய அணி", tagline: "Hello" } },
    ],
  });
  assert.equal(r["/books/tla26"].noindex, true);
  assert.equal(r["/books/tla26"].image, "https://drive.google.com/thumbnail?id=abc&sz=w1200");
  assert.equal(r["/books/thamilaruvi26"].image, "/images/books/c.webp");
  assert.equal(r["/books/secret"], undefined);
  assert.equal(r["/events/thamilaruvi"].title, "தமிழருவி 2026");
  assert.ok(r["/events/thamilaruvi"].description.length > 20, "keeps the built-in description when none is saved");
  assert.equal(r["/events/kalai-vizha"].image, "https://res.cloudinary.com/x.jpg");
  assert.ok(r["/events/brammam/meerigai"]);
  assert.equal(r["/events/brammam-meerigai"], undefined);
  assert.equal(r["/teams/2"], undefined);
  assert.match(r["/teams/7"].description, /Hello/);
});

test("an uploaded PDF's first page is used when there's no cover", () => {
  assert.equal(
    bookImage({ source: "upload", pdf_url: "https://res.cloudinary.com/d/image/upload/v1/books/a.pdf" }),
    "https://res.cloudinary.com/d/image/upload/pg_1,w_1200,c_limit,q_auto,f_jpg/v1/books/a.jpg"
  );
});

test("a page's HTML gets its own tags and loses the home page's", () => {
  const html = pageHtml(TEMPLATE, "/books", { title: "நூல்கள்", description: 'Books & "more"', image: "/og/x.jpg" });
  assert.match(html, /<title>நூல்கள் \| தமிழ் இலக்கிய மன்றம்<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/tlauom.com\/books"/);
  assert.match(html, /content="Books &amp; &quot;more&quot;"/);
  assert.match(html, /og:image" content="https:\/\/tlauom.com\/og\/x.jpg"/);
  assert.doesNotMatch(html, /content="home"/);
  assert.doesNotMatch(html, /twitter:card" content="x"/);
  assert.equal((html.match(/<title>/g) || []).length, 1);
  assert.match(html, /application\/ld\+json/, "the organisation details stay");
  assert.match(html, /<div id="root"><\/div>/, "the page itself is untouched");
});

test("English pages say so, private pages ask not to be indexed", () => {
  assert.match(pageHtml(TEMPLATE, "/privacy", { title: "Privacy", lang: "en" }), /<html lang="en"/);
  assert.match(headTags("/login", { noindex: true }).html, /name="robots" content="noindex, follow"/);
});

test("the Search Console code is added once", () => {
  const once = withVerification(TEMPLATE, "abc123");
  assert.match(once, /google-site-verification" content="abc123"/);
  assert.equal(withVerification(once, "abc123"), once);
  assert.equal(withVerification(TEMPLATE, ""), TEMPLATE);
});

test("the sitemap lists indexable pages, home first, with dates", () => {
  const xml = sitemapXml({
    "/teams/1": { title: "x" },
    "/": {},
    "/books": { lastmod: "2026-10-01T10:00:00Z" },
    "/login": { noindex: true },
  });
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, ["https://tlauom.com/", "https://tlauom.com/books", "https://tlauom.com/teams/1"]);
  assert.match(xml, /<lastmod>2026-10-01<\/lastmod>/);
});

// ---- Answer engines: page text, /faq, llms.txt ----

const { pageBody, withBody, withJsonLd } = require("./body");
const { faqGroups, faqSchema } = require("./faq");
const { llmsTxt } = require("./llms");

const SHELL = '<html><head><title>x</title></head><body><div id="root"><h1>old</h1></div><div id="loader"></div></body></html>';
const CONTACT = { email: "a@b.com", phoneNumber: "076", facebookUrl: "https://facebook.com/x" };

test("the built-in questions are grouped, with English and filled tokens", () => {
  const groups = faqGroups([], CONTACT, "1,234");
  assert.ok(groups.length > 3);
  const all = groups.flatMap((g) => g.items);
  assert.ok(!all.some((f) => f.id === "not-found"));
  const what = all.find((f) => f.id === "what-is-tla");
  assert.match(what.en.q, /What is the Tamil Literary Association/);
  assert.ok(!all.some((f) => /\{(email|members|phone)\}/.test(f.a + (f.en ? f.en.a : ""))));
});

test("live rows win over the built-in ones, and hidden ones are left out", () => {
  const rows = [
    { id: "a", cat: "about", q: "கேள்வி?", a: "பதில் {email}", q_en: "Q?", a_en: "A {email}", is_visible: true, sort_order: 1 },
    { id: "b", cat: "about", q: "மறை?", a: "x", is_visible: false, sort_order: 0 },
  ];
  const groups = faqGroups(rows, CONTACT, "");
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].items.map((f) => f.id), ["a"]);
  assert.equal(groups[0].items[0].en.a, "A a@b.com");
});

test("each page's root gets its own text; /faq gets the answers and FAQPage data", () => {
  const faq = faqGroups([], CONTACT, "");
  const home = withBody(SHELL, pageBody("/", { description: "Home desc" }, { faq }));
  assert.match(home, /<div id="root"><main[^>]*><h1>[^<]*Tamil Literary Association/);
  assert.match(home, /founded in 1968/);
  assert.match(home, /<\/main><\/div><div id="loader">/);
  assert.ok(!home.includes("<h1>old</h1>"));

  const page = withJsonLd(withBody(SHELL, pageBody("/faq", { title: "FAQ", description: "d" }, { faq })), faqSchema(faq, "https://tlauom.com"));
  assert.match(page, /What is the Tamil Literary Association \(TLA\)\?/);
  assert.match(page, /"@type":"FAQPage"/);
  assert.ok(!/founded in 1968 as the "Tamil Mantram" and has run/.test(page.split("<h2>")[0]));

  const other = withBody(SHELL, pageBody("/books", { title: "நூல்கள்", description: "<b>" }));
  assert.match(other, /<h1>நூல்கள்<\/h1><p>&lt;b&gt;<\/p>/);
});

test("llms.txt has the summary, key pages, more pages, answers and contact", () => {
  const faq = faqGroups([], CONTACT, "");
  const txt = llmsTxt({
    siteUrl: "https://tlauom.com",
    routes: { "/books/x": { title: "A [book]", description: "d" }, "/books/y": { title: "Hidden", noindex: true } },
    faq,
    contact: CONTACT,
  });
  assert.match(txt, /^# Tamil Literary Association, University of Moratuwa \(TLA UoM\)\n\n> /);
  assert.match(txt, /- \[Questions and answers\]\(https:\/\/tlauom\.com\/faq\)/);
  assert.match(txt, /- \[A book\]\(https:\/\/tlauom\.com\/books\/x\): d/);
  assert.ok(!txt.includes("Hidden"));
  assert.match(txt, /\*\*What is the Tamil Literary Association \(TLA\)\?\*\*/);
  assert.match(txt, /- Email: a@b\.com/);
});
