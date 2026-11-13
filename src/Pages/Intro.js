// /intro — the association in one scroll, made for the link in a social-media
// bio: a night-sky hero where the emblem sits in a gold kolam that draws
// itself, then our social pages, the events and the main parts of the site.
// Standalone (no site nav/footer, see App.js). The social links are the ones
// edited at /admin/contact; event names, texts and pictures come from
// src/seo/pages.json, so they stay in step with the rest of the site.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiArrowUpRight, FiArrowRight, FiArrowUp } from "react-icons/fi";

import Kolam from "../Components/Home/Intro/Kolam";
import Reveal from "../shared/Reveal/Reveal";
import { fetchContactConfig, getCachedContactConfig } from "../shared/contactConfig";
import seoPages from "../seo/pages.json";
import emblem from "../images/LandingPage/V01-intro.webp";
import "./Intro.css";

const { pages } = seoPages;

// A stylesheet @import in the middle of the site's bundled CSS is ignored by
// browsers, so the page's two fonts are linked in the head instead.
const FONTS =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap";

// The vowels of the Tamil alphabet, drawn big and faint behind the footer.
const UYIR = ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"];

// The account's name as it appears in its link: ".../tla_uom/" → "tla_uom".
// "" when the link doesn't end in a name (a profile.php link, say).
const nameIn = (url) => {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    return /^@?[\w-]{2,30}$/.test(last) ? last : "";
  } catch {
    return "";
  }
};
const handle = (url) => {
  const n = nameIn(url);
  return n && (n.startsWith("@") ? n : `@${n}`);
};

const socialsOf = (c) =>
  [
    { key: "instagram", name: "Instagram", note: handle(c.instagramUrl), href: c.instagramUrl, Icon: FaInstagram },
    { key: "youtube", name: "YouTube", note: handle(c.youtubeUrl), href: c.youtubeUrl, Icon: FaYoutube },
    { key: "facebook", name: "Facebook", note: nameIn(c.facebookUrl), href: c.facebookUrl, Icon: FaFacebookF },
    { key: "linkedin", name: "LinkedIn", note: nameIn(c.linkedinUrl), href: c.linkedinUrl, Icon: FaLinkedinIn },
    { key: "x", name: "X", note: handle(c.xUrl), href: c.xUrl, Icon: FaXTwitter },
  ].filter((s) => s.href);

// The events shown as cards, in this order.
const STAGE = ["thamilaruvi", "sotkanai", "brammam", "vani-villa", "thaipongal", "jeevanathi"]
  .map((id) => {
    const path = `/events/${id}`;
    const meta = pages[path];
    return meta && meta.title && meta.image ? { path, title: meta.title, text: meta.description, image: meta.image } : null;
  })
  .filter(Boolean);

// Every event's name, for the ticker under the hero.
const TICKER = Object.entries(pages)
  .filter(([path, meta]) => /^\/(events\/[a-z-]+|ideathon)$/.test(path) && meta.title && !meta.noindex && path !== "/events/sotkanai-district")
  .map(([, meta]) => meta.title);

const EXPLORE = [
  { ta: "வரலாறு", en: "History", note: "How the association began", to: "/history" },
  { ta: "நூல்கள்", en: "Books", note: "Read what we publish", to: "/books" },
  { ta: "அணிகள்", en: "Teams", note: "The people behind the work", to: "/teams" },
  { ta: "உறுப்பினர்கள்", en: "Members", note: "Everyone, batch by batch", to: "/members" },
  { ta: "தொடர்புகள்", en: "Contact", note: "Write to us", to: "/contact" },
];

const outside = { target: "_blank", rel: "noopener noreferrer" };

function SectionHead({ ta, title, note, children }) {
  return (
    <header className="in-head">
      <div>
        <p className="in-eyebrow" lang="ta">
          {ta}
        </p>
        <h2>{title}</h2>
        {note && <p className="in-head-note">{note}</p>}
      </div>
      {children}
    </header>
  );
}

export default function Intro() {
  const [cfg, setCfg] = useState(getCachedContactConfig);

  useEffect(() => {
    let alive = true;
    fetchContactConfig()
      .then((c) => alive && setCfg(c))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const socials = socialsOf(cfg);
  const [lead, ...rest] = socials;

  return (
    <main className="in-page">
      <Helmet>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </Helmet>
      {/* ---------- hero ---------- */}
      <section className="in-hero">
        <div className="in-wrap">
          <div className="in-bar">
            <Link to="/" className="in-brand">
              <img src="/favicon-192.png" alt="" width="40" height="40" />
              <span>
                <b>Tamil Literary Association</b>
                <small>University of Moratuwa</small>
              </span>
            </Link>
            <Link to="/" className="in-site">
              tlauom.com <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          <div className="in-hero-grid">
            <div className="in-copy">
              <p className="in-kicker" lang="ta">
                மொறட்டுவைப் பல்கலைக்கழக தமிழ் இலக்கிய மன்றம்
              </p>
              <h1>
                One community. <em>Every link.</em>
              </h1>
              <p className="in-lede">
                Follow our stories, see what’s on stage, and find your way into everything happening across the TLA community.
              </p>
              <div className="in-cta">
                <Link to="/" className="in-btn is-gold">
                  Visit the website <FiArrowRight aria-hidden="true" />
                </Link>
                <Link to="/teams/join" className="in-btn">
                  Join a team
                </Link>
              </div>
              <ul className="in-quick" aria-label="Our social pages">
                {socials.map(({ key, name, href, Icon }) => (
                  <li key={key}>
                    <a href={href} {...outside} aria-label={name} title={name}>
                      <Icon aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="in-emblem">
              <div className="in-halo" aria-hidden="true">
                <Kolam className="in-kolam" />
              </div>
              <img src={emblem} alt="தமிழ் இலக்கிய மன்றம்" width="760" height="594" />
            </div>
          </div>
        </div>

        {TICKER.length > 0 && (
          <div className="in-ticker" aria-hidden="true" lang="ta">
            <div className="in-ticker-track">
              {[0, 1].map((copy) => (
                <span key={copy}>
                  {TICKER.map((t) => (
                    <i key={t}>{t}</i>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="in-body">
        {/* ---------- social pages ---------- */}
        {lead && (
          <Reveal as="section" className="in-sec in-wrap">
            <SectionHead ta="சமூக ஊடகங்கள்" title="Follow along" />
            <div className="in-social">
              <a className="in-tile is-lead" href={lead.href} {...outside}>
                <Kolam className="in-kolam-still" />
                <span className="in-tile-top">
                  <span className={`in-ico t-${lead.key}`}>
                    <lead.Icon aria-hidden="true" />
                  </span>
                  <span className="in-go" aria-hidden="true">
                    <FiArrowUpRight />
                  </span>
                </span>
                <span className="in-tile-txt">
                  <small>Start here</small>
                  <strong>{lead.name}</strong>
                  {lead.note && <span>{lead.note}</span>}
                </span>
              </a>
              {rest.map(({ key, name, note, href, Icon }) => (
                <a key={key} className="in-tile" href={href} {...outside}>
                  <span className="in-tile-top">
                    <span className={`in-ico t-${key}`}>
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="in-go" aria-hidden="true">
                      <FiArrowUpRight />
                    </span>
                  </span>
                  <span className="in-tile-txt">
                    <strong>{name}</strong>
                    {note && <span>{note}</span>}
                  </span>
                </a>
              ))}
            </div>
          </Reveal>
        )}

        {/* ---------- events ---------- */}
        <Reveal as="section" className="in-sec in-wrap">
          <SectionHead ta="நிகழ்வுகள்" title="On our stage">
            <Link to="/" className="in-more">
              All events <FiArrowRight aria-hidden="true" />
            </Link>
          </SectionHead>
          <div className="in-stage">
            {STAGE.map((e) => (
              <Link key={e.path} to={e.path} className="in-card" lang="ta">
                <span className="in-card-art">
                  <img src={e.image} alt="" loading="lazy" width="1200" height="630" />
                </span>
                <span className="in-card-txt">
                  <strong>{e.title}</strong>
                  <span>{e.text}</span>
                </span>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* ---------- the rest of the site ---------- */}
        <Reveal as="section" className="in-sec in-wrap is-split">
          <SectionHead ta="மன்றம்" title="Find your way" note="Our story so far, the books we publish, the teams that run it all, and how to reach us." />
          <nav className="in-index" aria-label="More of the website">
            {EXPLORE.map((x) => (
              <Link key={x.to} to={x.to}>
                <b lang="ta">{x.ta}</b>
                <span>
                  <strong>{x.en}</strong>
                  <small>{x.note}</small>
                </span>
                <FiArrowRight aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </Reveal>
      </div>

      {/* ---------- sign-off ---------- */}
      <footer className="in-foot">
        <div className="in-foot-halo" aria-hidden="true">
          <Kolam className="in-kolam-still" />
        </div>

        <div className="in-letters" aria-hidden="true" lang="ta">
          <div className="in-letters-track">
            {[0, 1].map((copy) => (
              <span key={copy}>
                {UYIR.map((l) => (
                  <i key={l}>{l}</i>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div className="in-wrap in-foot-main">
          <span className="in-crest">
            <img src="/favicon-192.png" alt="" width="64" height="64" loading="lazy" />
          </span>
          <p className="in-foot-ta" lang="ta">
            தமிழ் இலக்கிய மன்றம்
          </p>
          <p className="in-foot-en">Tamil Literary Association · University of Moratuwa</p>

          <ul className="in-quick" aria-label="Our social pages">
            {socials.map(({ key, name, href, Icon }) => (
              <li key={key}>
                <a href={href} {...outside} aria-label={name} title={name}>
                  <Icon aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <p className="in-foot-links">
            <Link to="/">tlauom.com</Link>
            <a href={`mailto:${cfg.email}`}>{cfg.email}</a>
            <Link to="/privacy">Privacy</Link>
          </p>
        </div>

        <div className="in-wrap in-foot-base">
          <span>© {new Date().getFullYear()} Tamil Literary Association</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Back to top <FiArrowUp aria-hidden="true" />
          </button>
        </div>
      </footer>
    </main>
  );
}
