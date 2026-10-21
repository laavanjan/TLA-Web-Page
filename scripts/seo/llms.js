// llms.txt (https://llmstxt.org): a plain-text guide to the site for AI
// assistants - who TLA is, its key pages, and the help assistant's answers
// (English where there is one, else the Tamil). Written fresh on every build.
const { ABOUT_FACTS, KEY_PAGES } = require("./about");
const { plain } = require("./faq");

const SITE_NAME_EN = "Tamil Literary Association, University of Moratuwa";

// Markdown link text can't hold brackets or line breaks.
const one = (s) => String(s || "").replace(/\s+/g, " ").replace(/[[\]]/g, "").trim();

function llmsTxt({ siteUrl, routes = {}, faq = [], contact = {} }) {
  const url = (p) => `${siteUrl}${p === "/" ? "/" : p}`;
  const lines = [
    `# ${SITE_NAME_EN} (TLA UoM)`,
    "",
    "> The Tamil Literary Association (TLA, தமிழ் இலக்கிய மன்றம்) is a student organisation of the University of Moratuwa, Sri Lanka, founded in 1968. It runs the Thamilaruvi arts festival, the Sotkanai school debating competition, the Brammam online competitions and the Jeevanathi charity work.",
    "",
    ...ABOUT_FACTS.flatMap((f) => [f, ""]),
    "## Key pages",
    "",
    ...KEY_PAGES.map(([p, label, about]) => `- [${label}](${url(p)}): ${about}`),
    "",
  ];

  // Every other public page the sitemap lists: events, teams, books.
  const listed = new Set(KEY_PAGES.map(([p]) => p));
  const more = Object.entries(routes)
    .filter(([p, m]) => !listed.has(p) && !m.noindex && m.title && !p.startsWith("/admin"))
    .sort(([a], [b]) => a.localeCompare(b));
  if (more.length) {
    lines.push("## More pages", "");
    more.forEach(([p, m]) => lines.push(`- [${one(m.title)}](${url(p)})${m.description ? `: ${one(m.description)}` : ""}`));
    lines.push("");
  }

  if (faq.length) {
    lines.push("## Questions and answers", "", `The same answers are on ${url("/faq")}, in Tamil and English.`, "");
    faq.forEach((g) => {
      lines.push(`### ${g.label_en || g.label}`, "");
      g.items.forEach((f) => {
        const q = f.en ? f.en.q : f.q;
        const a = f.en ? f.en.a : f.a;
        lines.push(`**${one(q)}**`, plain(a), "");
      });
    });
  }

  const social = [
    ["Facebook", contact.facebookUrl],
    ["YouTube", contact.youtubeUrl],
    ["Instagram", contact.instagramUrl],
    ["LinkedIn", contact.linkedinUrl],
    ["X", contact.xUrl],
  ].filter(([, u]) => /^https?:\/\//.test(u || ""));
  lines.push("## Contact", "");
  if (contact.email) lines.push(`- Email: ${contact.email}`);
  social.forEach(([name, u]) => lines.push(`- ${name}: ${u}`));
  lines.push(`- Website: ${url("/")}`, "");

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

module.exports = { llmsTxt };
