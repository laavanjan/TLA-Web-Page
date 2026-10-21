// Readable text inside each page's <div id="root"> in the built HTML, for
// crawlers that don't run JavaScript - most AI answer engines read only this.
// Each page gets its own heading and description; the home page adds the
// "About TLA" facts and /faq every question and answer. React replaces it all
// as soon as the app starts (and the loader covers it until then), so
// visitors never see it. It says only what the real page says.
const { ABOUT_TITLE, ABOUT_FACTS, KEY_PAGES } = require("./about");

const SITE_NAME = "தமிழ் இலக்கிய மன்றம்";
const SITE_NAME_EN = "Tamil Literary Association, University of Moratuwa";

const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// An answer as paragraphs and bullet lists, the way /faq shows it.
function answerHtml(text, lang) {
  const attr = lang ? ` lang="${lang}"` : "";
  const out = [];
  let list = null;
  String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const item = line.match(/^[•\-–]\s+(.*)$/);
      if (item) {
        if (!list) out.push((list = []));
        list.push(item[1]);
      } else {
        list = null;
        out.push(line);
      }
    });
  return out
    .map((b) => (Array.isArray(b) ? `<ul${attr}>${b.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : `<p${attr}>${esc(b)}</p>`))
    .join("");
}

function faqHtml(groups) {
  return groups
    .map(
      (g) =>
        `<section id="${esc(g.id)}"><h2>${esc(g.label)} <small lang="en">${esc(g.label_en)}</small></h2>` +
        g.items
          .map(
            (f) =>
              `<article id="${esc(f.id)}"><h3>${esc(f.q)}</h3>${answerHtml(f.a)}` +
              (f.en ? `<h3 lang="en">${esc(f.en.q)}</h3>${answerHtml(f.en.a, "en")}` : "") +
              `</article>`
          )
          .join("") +
        `</section>`
    )
    .join("");
}

const aboutHtml = () =>
  `<section lang="en"><h2>${esc(ABOUT_TITLE)}</h2>${ABOUT_FACTS.map((f) => `<p>${esc(f)}</p>`).join("")}</section>`;

const navHtml = () =>
  `<nav aria-label="Pages"><ul>${KEY_PAGES.map(([p, label]) => `<li><a href="${esc(p)}">${esc(label)}</a></li>`).join("")}</ul></nav>`;

// The root's contents for one page. `faq` is faqGroups() for /faq.
function pageBody(pagePath, meta, { faq } = {}) {
  const home = pagePath === "/";
  const heading = home ? `மொறட்டுவைப் பல்கலைக்கழக தமிழ் இலக்கிய மன்றம் — ${SITE_NAME_EN} (TLA UoM)` : meta.title || SITE_NAME;
  const parts = [`<h1>${esc(heading)}</h1>`];
  if (meta.description) parts.push(`<p>${esc(meta.description)}</p>`);
  if (home) parts.push(aboutHtml());
  if (pagePath === "/faq" && faq && faq.length) parts.push(faqHtml(faq));
  parts.push(navHtml());
  if (!home) parts.push(`<p lang="en">${esc(SITE_NAME_EN)} · ${esc(SITE_NAME)}</p>`);
  return `<main style="max-width:46rem;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;line-height:1.6">${parts.join("")}</main>`;
}

// The built HTML with the root's contents swapped for `inner`. The root is
// followed by the loader in public/index.html, which marks where it ends.
function withBody(html, inner) {
  const re = /(<div id="root">)[\s\S]*?(<\/div>\s*<div id="loader")/i;
  return re.test(html) ? html.replace(re, (m, open, close) => `${open}${inner}${close}`) : html;
}

// Structured data added to a page's head; data-react-helmet so react-helmet
// replaces it with the page's own copy once the app runs.
const withJsonLd = (html, data) =>
  html.replace(/<\/head>/i, `<script type="application/ld+json" data-react-helmet="true">${JSON.stringify(data).replace(/</g, "\\u003c")}</script></head>`);

module.exports = { pageBody, withBody, withJsonLd, answerHtml, esc };
