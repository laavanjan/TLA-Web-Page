// Runs after `npm run build` (the "postbuild" script). Using the pages from
// src/seo/pages.json and the books, events, teams and questions in Supabase it
// writes:
//   build/<page>.html .... index.html with that page's own title, description,
//                          canonical link and share tags, and readable text
//                          for crawlers that don't run JavaScript (most AI
//                          answer engines): the page's heading and summary,
//                          the "About TLA" facts on the home page and every
//                          question and answer on /faq (served at /<page>
//                          because vercel.json has cleanUrls on)
//   build/sitemap.xml .... every public page, generated fresh each build
//   build/llms.txt ....... a plain-text guide to the site for AI assistants
// It never fails the build: without Supabase it still does the fixed pages
// and the built-in questions.
// Set GOOGLE_SITE_VERIFICATION to the code from Google Search Console's
// "HTML tag" method and every page carries it.
const fs = require("fs");
const path = require("path");
const { loadRoutes, loadAnswers } = require("./seo/routes");
const { pageHtml, withVerification, SITE_URL } = require("./seo/html");
const { sitemapXml } = require("./seo/sitemap");
const { pageBody, withBody, withJsonLd } = require("./seo/body");
const { faqGroups, faqSchema, defaultContact } = require("./seo/faq");
const { llmsTxt } = require("./seo/llms");

const BUILD = path.join(__dirname, "..", "build");

async function main() {
  const indexFile = path.join(BUILD, "index.html");
  if (!fs.existsSync(indexFile)) {
    console.warn("seo: build/index.html not found; skipping.");
    return;
  }
  const template = fs.readFileSync(indexFile, "utf8");
  const verification = (process.env.GOOGLE_SITE_VERIFICATION || process.env.REACT_APP_GOOGLE_SITE_VERIFICATION || "").trim();
  const [routes, answers] = await Promise.all([loadRoutes(process.env), loadAnswers(process.env)]);
  const contact = { ...defaultContact(), ...answers.contact };
  const faq = faqGroups(answers.faqs, contact, answers.members);

  // The page's own text in the root, and on /faq the questions' structured data.
  const finish = (html, pagePath, meta) => {
    let out = withBody(html, pageBody(pagePath, meta, { faq }));
    if (pagePath === "/faq" && faq.length) out = withJsonLd(out, faqSchema(faq, SITE_URL));
    return withVerification(out, verification);
  };

  let written = 0;
  Object.entries(routes).forEach(([pagePath, meta]) => {
    if (pagePath === "/") return; // index.html already has the home page's tags
    const file = path.join(BUILD, `${pagePath.replace(/^\//, "")}.html`);
    if (!file.startsWith(BUILD + path.sep)) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, finish(pageHtml(template, pagePath, meta), pagePath, meta));
    written += 1;
  });
  fs.writeFileSync(indexFile, finish(template, "/", routes["/"] || {}));
  fs.writeFileSync(path.join(BUILD, "llms.txt"), llmsTxt({ siteUrl: SITE_URL, routes, faq, contact }));

  const xml = sitemapXml(routes);
  fs.writeFileSync(path.join(BUILD, "sitemap.xml"), xml);
  const listed = (xml.match(/<url>/g) || []).length;
  console.log(`seo: wrote ${written} pages, llms.txt (${faq.reduce((n, g) => n + g.items.length, 0)} answers) and a sitemap of ${listed} pages${verification ? " (with Search Console code)" : ""}.`);
}

main().catch((err) => {
  console.warn(`seo: skipped (${err.message}).`);
});
