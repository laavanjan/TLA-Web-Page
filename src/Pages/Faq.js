// /faq — the help assistant's questions and answers (edited at /admin/faq) as
// a plain page, for search engines and AI answer tools. It isn't linked from
// the site's menus, so visitors keep using the உதவி button; search engines
// find it through the sitemap. Everything in its structured data (FAQPage) is
// on the page, as Google requires.
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FaQuestionCircle, FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";

import Seo from "../seo/Seo";
import { SITE_URL } from "../seo/site";
import { useFaqs, useFaqContext, inLanguage, fillTokens, NOT_FOUND_ID, FAQ_CATEGORIES } from "../shared/faq/faqs";
import "./Faq.css";

// Plain text for the structured data: no bullets' dashes or double spaces.
const plain = (s) =>
  String(s || "")
    .split("\n")
    .map((l) => l.replace(/^\s*[•\-–]\s+/, "").trim())
    .filter(Boolean)
    .join(" ");

// An answer as paragraphs and bullet lists, the way the assistant shows it.
function Answer({ text }) {
  const blocks = [];
  String(text)
    .split("\n")
    .forEach((raw) => {
      const line = raw.trim();
      if (!line) return;
      const bullet = /^\s*[•\-–]\s+/.test(line);
      const last = blocks[blocks.length - 1];
      if (bullet && last && last.list) last.items.push(line.replace(/^\s*[•\-–]\s+/, ""));
      else if (bullet) blocks.push({ list: true, items: [line.replace(/^\s*[•\-–]\s+/, "")] });
      else blocks.push({ list: false, text: line });
    });
  return blocks.map((b, i) =>
    b.list ? (
      <ul key={i}>
        {b.items.map((item, k) => (
          <li key={k}>{item}</li>
        ))}
      </ul>
    ) : (
      <p key={i}>{b.text}</p>
    )
  );
}

function Links({ links, ctx }) {
  const shown = links
    .map((l, i) => {
      const label = fillTokens(l.text, ctx);
      if (l.to) {
        return (
          <Link key={i} to={l.to}>
            {label} <FaArrowRight aria-hidden="true" />
          </Link>
        );
      }
      const href = fillTokens(l.href, ctx);
      if (/\{\w+\}/.test(href) || !/^(https?:|mailto:|tel:)/i.test(href)) return null;
      return (
        <a key={i} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
          {label} <FaExternalLinkAlt aria-hidden="true" />
        </a>
      );
    })
    .filter(Boolean);
  return shown.length ? <div className="fq-links">{shown}</div> : null;
}

export default function Faq() {
  const faqs = useFaqs(true);
  const ctx = useFaqContext(true, "ta");
  const ctxEn = useFaqContext(true, "en");

  const groups = useMemo(() => {
    const list = faqs.filter((f) => f.is_visible && f.id !== NOT_FOUND_ID);
    return FAQ_CATEGORIES.map((c) => ({ ...c, items: list.filter((f) => f.cat === c.id) })).filter((g) => g.items.length);
  }, [faqs]);

  const jsonLd = useMemo(() => {
    const entities = [];
    groups.forEach((g) =>
      g.items.forEach((f) => {
        const ta = inLanguage(f, "ta");
        entities.push({
          "@type": "Question",
          name: fillTokens(ta.q, ctx),
          inLanguage: "ta",
          acceptedAnswer: { "@type": "Answer", text: plain(fillTokens(ta.a, ctx)), inLanguage: "ta" },
        });
        const en = inLanguage(f, "en");
        if (en.english) {
          entities.push({
            "@type": "Question",
            name: fillTokens(en.q, ctxEn),
            inLanguage: "en",
            acceptedAnswer: { "@type": "Answer", text: plain(fillTokens(en.a, ctxEn)), inLanguage: "en" },
          });
        }
      })
    );
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE_URL}/faq#faq`,
      url: `${SITE_URL}/faq`,
      about: { "@id": `${SITE_URL}/#org` },
      mainEntity: entities,
    };
  }, [groups, ctx, ctxEn]);

  return (
    <main className="fq">
      <Seo
        title="அடிக்கடி கேட்கப்படும் கேள்விகள் · FAQ"
        description="தமிழ் இலக்கிய மன்றம் பற்றிய கேள்விகளும் பதில்களும் — நிகழ்வுகள், போட்டிகள், அணிகளில் இணைதல், நூல்கள், தொடர்பு. Questions and answers about the Tamil Literary Association, University of Moratuwa."
        path="/faq"
        jsonLd={jsonLd}
      />

      <header className="fq-head">
        <FaQuestionCircle className="fq-head-icon" aria-hidden="true" />
        <h1>அடிக்கடி கேட்கப்படும் கேள்விகள்</h1>
        <p lang="en">Frequently asked questions about the Tamil Literary Association, University of Moratuwa</p>
      </header>

      <nav className="fq-toc" aria-label="Topics">
        {groups.map((g) => (
          <a key={g.id} href={`#${g.id}`}>
            {g.label}
            <small lang="en">{g.label_en}</small>
          </a>
        ))}
      </nav>

      {groups.map((g) => (
        <section key={g.id} id={g.id} className="fq-section">
          <h2>
            {g.label} <small lang="en">{g.label_en}</small>
          </h2>
          {g.items.map((f) => {
            const ta = inLanguage(f, "ta");
            const en = inLanguage(f, "en");
            return (
              <details key={f.id} id={f.id} className="fq-item">
                <summary>{fillTokens(ta.q, ctx)}</summary>
                <div className="fq-answer">
                  <Answer text={fillTokens(ta.a, ctx)} />
                  <Links links={ta.links} ctx={ctx} />
                  {en.english && (
                    <div className="fq-en" lang="en">
                      <h3>{fillTokens(en.q, ctxEn)}</h3>
                      <Answer text={fillTokens(en.a, ctxEn)} />
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </section>
      ))}
    </main>
  );
}
