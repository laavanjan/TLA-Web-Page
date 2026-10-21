// Writing a page's search and share tags into the built index.html, so
// crawlers that don't run JavaScript (WhatsApp, Facebook, most AI crawlers)
// still see each page's own title, description and picture. The tags carry
// data-react-helmet, so react-helmet takes them over once the page runs.
const SITE_URL = "https://tlauom.com";
const SITE_NAME = "தமிழ் இலக்கிய மன்றம்";
const SITE_NAME_EN = "Tamil Literary Association, University of Moratuwa";
const DEFAULT_IMAGE = "/og/home.jpg";

const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const absolute = (p) => (/^https?:\/\//i.test(p) ? p : `${SITE_URL}${p === "/" ? "/" : p}`);

// The same rule as clip() in src/seo/site.js.
function clip(text, max = 160) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}

function headTags(pagePath, meta) {
  const title = meta.title ? `${meta.title} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_NAME_EN} (TLA UoM)`;
  const shareTitle = meta.title || title;
  const desc = clip(meta.description);
  const url = absolute(pagePath);
  const image = absolute(meta.image || DEFAULT_IMAGE);
  const lang = meta.lang || "ta";
  const h = 'data-react-helmet="true"';
  const tags = [
    `<title>${esc(title)}</title>`,
    desc && `<meta ${h} name="description" content="${esc(desc)}"/>`,
    `<link ${h} rel="canonical" href="${esc(url)}"/>`,
    meta.noindex && `<meta ${h} name="robots" content="noindex, follow"/>`,
    `<meta ${h} property="og:type" content="${esc(meta.type || "website")}"/>`,
    `<meta ${h} property="og:site_name" content="${esc(SITE_NAME_EN)}"/>`,
    `<meta ${h} property="og:locale" content="${lang === "ta" ? "ta_LK" : "en_GB"}"/>`,
    `<meta ${h} property="og:title" content="${esc(shareTitle)}"/>`,
    desc && `<meta ${h} property="og:description" content="${esc(desc)}"/>`,
    `<meta ${h} property="og:url" content="${esc(url)}"/>`,
    `<meta ${h} property="og:image" content="${esc(image)}"/>`,
    `<meta ${h} name="twitter:card" content="summary_large_image"/>`,
    `<meta ${h} name="twitter:title" content="${esc(shareTitle)}"/>`,
    desc && `<meta ${h} name="twitter:description" content="${esc(desc)}"/>`,
    `<meta ${h} name="twitter:image" content="${esc(image)}"/>`,
  ];
  return { lang, html: tags.filter(Boolean).join("") };
}

// index.html with the home page's tags swapped for this page's.
function pageHtml(template, pagePath, meta) {
  const { lang, html } = headTags(pagePath, meta);
  return template
    .replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta[^>]+name="(description|robots|twitter:[^"]*)"[^>]*>/gi, "")
    .replace(/<meta[^>]+property="og:[^"]*"[^>]*>/gi, "")
    .replace(/<link[^>]+rel="canonical"[^>]*>/gi, "")
    .replace(/<\/head>/i, `${html}</head>`);
}

// Google Search Console's "HTML tag" check, when its code is set.
function withVerification(html, code) {
  if (!code || /name="google-site-verification"/.test(html)) return html;
  return html.replace(/<\/head>/i, `<meta name="google-site-verification" content="${esc(code)}"/></head>`);
}

module.exports = { headTags, pageHtml, withVerification, clip, absolute, SITE_URL };
