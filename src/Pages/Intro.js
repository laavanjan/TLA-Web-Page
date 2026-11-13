// /intro — a single-screen "all our links" page: who we are, our official
// social pages and the main areas of the site. Standalone (no site nav/footer,
// see App.js) so it works as the link in a social-media bio. The social links
// are the ones edited at /admin/contact.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaCalendarAlt, FaBookOpen, FaUsers, FaEnvelope } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiArrowUpRight } from "react-icons/fi";

import { fetchContactConfig, getCachedContactConfig } from "../shared/contactConfig";
import "./Intro.css";

// "https://www.instagram.com/tla_uom/" → "@tla_uom"; "" when there's no handle.
const handleOf = (url) => {
  try {
    const seg = new URL(url).pathname.split("/").filter(Boolean)[0] || "";
    return seg.startsWith("@") ? seg : "";
  } catch {
    return "";
  }
};

const SOCIALS = (c) => [
  { key: "facebook", name: "TLA Facebook", note: "Official page", href: c.facebookUrl, Icon: FaFacebookF },
  { key: "instagram", name: "TLA Instagram", note: "@tla_uom", href: c.instagramUrl, Icon: FaInstagram },
  { key: "linkedin", name: "TLA LinkedIn", note: "Official page", href: c.linkedinUrl, Icon: FaLinkedinIn },
  { key: "youtube", name: "TLA YouTube", note: handleOf(c.youtubeUrl) || "Official channel", href: c.youtubeUrl, Icon: FaYoutube },
  { key: "x", name: "TLA on X", note: "@TLAuom", href: c.xUrl, Icon: FaXTwitter },
];

const PILLARS = [
  { name: "Events", note: "Tamilaruvi, Sorkanai and more", href: "/#timeline", Icon: FaCalendarAlt },
  { name: "Books", note: "Read our publications", to: "/books", Icon: FaBookOpen },
  { name: "Teams", note: "Meet the teams, join in", to: "/teams", Icon: FaUsers },
  { name: "Contact", note: "Say hello to us", to: "/contact", Icon: FaEnvelope },
];

const pad = (n) => String(n).padStart(2, "0");

function Row({ icon: Icon, tone, name, note, ...link }) {
  const inner = (
    <>
      <span className={`in-ico ${tone}`}>{Icon ? <Icon aria-hidden="true" /> : null}</span>
      <span className="in-txt">
        <strong>{name}</strong>
        <small>{note}</small>
      </span>
      <span className="in-go" aria-hidden="true">
        <FiArrowUpRight />
      </span>
    </>
  );
  return link.to ? (
    <Link className="in-row" to={link.to}>
      {inner}
    </Link>
  ) : (
    <a className="in-row" href={link.href} {...(link.internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
      {inner}
    </a>
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

  const socials = SOCIALS(cfg).filter((s) => s.href);

  return (
    <main className="in-page">
      <section className="in-hero">
        <div className="in-brand">
          <span className="in-mark">T</span>
          <span>
            <small>University of Moratuwa</small>
            <b>Tamil Literary Association</b>
          </span>
        </div>
        <p className="in-eyebrow">Connect with TLA</p>
        <h1>
          One community.
          <em>Every link.</em>
        </h1>
        <p className="in-lede">
          Follow our stories, meet the teams, and stay close to everything happening across the TLA community.
        </p>
        <p className="in-est">
          <span /> Est. at UoM
        </p>
        <span className="in-glyph" aria-hidden="true">
          த
        </span>
      </section>

      <section className="in-sec">
        <header>
          <div>
            <p className="in-eyebrow">Stay in the loop</p>
            <h2>Official pages</h2>
          </div>
          <span className="in-count">{pad(socials.length)}</span>
        </header>
        <div className="in-list">
          {socials.map((s) => (
            <Row key={s.key} icon={s.Icon} tone={`t-${s.key}`} name={s.name} note={s.note} href={s.href} />
          ))}
        </div>
      </section>

      <section className="in-sec">
        <header>
          <div>
            <p className="in-eyebrow">Built by the community</p>
            <h2>Main pillars</h2>
          </div>
          <span className="in-count">{pad(PILLARS.length)}</span>
        </header>
        <div className="in-list">
          {PILLARS.map((p) => (
            <Row key={p.name} tone="t-pillar" name={p.name} note={p.note} to={p.to} href={p.href} internal icon={p.Icon} />
          ))}
        </div>
      </section>

      <p className="in-foot">
        <Link to="/">tlauom.com</Link>
      </p>
    </main>
  );
}
