// sitemap.xml from the list of pages: everything public and indexable, with
// the date it last changed where the database knows it.
const { absolute } = require("./html");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Home first, then the main sections, then the rest in address order.
const weight = (p) => (p === "/" ? 0 : p.split("/").length);

function sitemapXml(routes) {
  const urls = Object.entries(routes)
    .filter(([, meta]) => !meta.noindex)
    .sort(([a], [b]) => weight(a) - weight(b) || a.localeCompare(b))
    .map(([p, meta]) => {
      const lastmod = meta.lastmod && !Number.isNaN(Date.parse(meta.lastmod)) ? new Date(meta.lastmod).toISOString().slice(0, 10) : "";
      return `  <url>\n    <loc>${esc(absolute(p))}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

module.exports = { sitemapXml };
