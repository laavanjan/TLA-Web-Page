// Runs after `npm run build` (the "postbuild" script). Using the pages from
// src/seo/pages.json and the books, events and teams in Supabase it writes:
//   build/<page>.html .... index.html with that page's own title, description,
//                          canonical link and share tags (served at /<page>
//                          because vercel.json has cleanUrls on)
//   build/sitemap.xml .... every public page, generated fresh each build
// It never fails the build: without Supabase it still does the fixed pages.
// Set GOOGLE_SITE_VERIFICATION to the code from Google Search Console's
// "HTML tag" method and every page carries it.
const fs = require("fs");
const path = require("path");
const { loadRoutes } = require("./seo/routes");
const { pageHtml, withVerification } = require("./seo/html");
const { sitemapXml } = require("./seo/sitemap");

const BUILD = path.join(__dirname, "..", "build");

async function main() {
  const indexFile = path.join(BUILD, "index.html");
  if (!fs.existsSync(indexFile)) {
    console.warn("seo: build/index.html not found; skipping.");
    return;
  }
  const template = fs.readFileSync(indexFile, "utf8");
  const verification = (process.env.GOOGLE_SITE_VERIFICATION || process.env.REACT_APP_GOOGLE_SITE_VERIFICATION || "").trim();
  const routes = await loadRoutes(process.env);

  let written = 0;
  Object.entries(routes).forEach(([pagePath, meta]) => {
    if (pagePath === "/") return; // index.html already has the home page's tags
    const file = path.join(BUILD, `${pagePath.replace(/^\//, "")}.html`);
    if (!file.startsWith(BUILD + path.sep)) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, withVerification(pageHtml(template, pagePath, meta), verification));
    written += 1;
  });
  fs.writeFileSync(indexFile, withVerification(template, verification));

  const xml = sitemapXml(routes);
  fs.writeFileSync(path.join(BUILD, "sitemap.xml"), xml);
  const listed = (xml.match(/<url>/g) || []).length;
  console.log(`seo: wrote ${written} page heads and a sitemap of ${listed} pages${verification ? " (with Search Console code)" : ""}.`);
}

main().catch((err) => {
  console.warn(`seo: skipped (${err.message}).`);
});
