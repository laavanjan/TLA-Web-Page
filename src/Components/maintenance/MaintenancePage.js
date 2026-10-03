// What visitors see while maintenance mode is on. Tamil first, English
// underneath. If the admin leaves the heading or message empty, the built-in
// wording is used. The illustration is public/images/maintenance.webp; if that
// file is ever missing a built-in icon is shown instead.
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FaTools, FaCog, FaEnvelope, FaFacebook, FaInstagram, FaYoutube, FaRegClock } from "react-icons/fa";
import {
  DEFAULT_TITLE,
  DEFAULT_TITLE_EN,
  DEFAULT_MESSAGE,
  DEFAULT_MESSAGE_EN,
  formatReopen,
} from "../../shared/siteStatus";
import { getCachedContactConfig, fetchContactConfig } from "../../shared/contactConfig";
import "./maintenance.css";

const IMAGE = "/images/maintenance.webp";

// "2 மணி 10 நிமி" style countdown in Tamil, "" once it is within a minute.
function remaining(iso, now) {
  const mins = Math.floor((Date.parse(iso) - now) / 60000);
  if (mins < 1) return "";
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return [d ? `${d} நாள்` : "", h ? `${h} மணி` : "", !d && m ? `${m} நிமி` : ""].filter(Boolean).join(" ");
}

function Illustration() {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <div className="mt-icon" aria-hidden="true">
        <FaCog className="mt-icon-gear" />
        <FaTools className="mt-icon-tools" />
      </div>
    );
  }
  return (
    <div className="mt-art">
      <img className="mt-image" src={IMAGE} alt="" onError={() => setMissing(true)} />
    </div>
  );
}

export default function MaintenancePage({ status, now = Date.now(), preview = false }) {
  const [contact, setContact] = useState(getCachedContactConfig);
  useEffect(() => {
    if (preview) return;
    fetchContactConfig()
      .then(setContact)
      .catch(() => {});
  }, [preview]);

  const custom = { title: !!status.title, message: !!status.message };
  const left = status.reopensAt ? remaining(status.reopensAt, now) : "";
  const links = [
    contact.email && { href: `mailto:${contact.email}`, label: contact.email, icon: FaEnvelope },
    contact.facebookUrl && { href: contact.facebookUrl, label: "Facebook", icon: FaFacebook },
    contact.instagramUrl && { href: contact.instagramUrl, label: "Instagram", icon: FaInstagram },
    contact.youtubeUrl && { href: contact.youtubeUrl, label: "YouTube", icon: FaYoutube },
  ].filter(Boolean);

  return (
    <main className={`mt-page${preview ? " is-preview" : ""}`}>
      {!preview && (
        <Helmet>
          <title>பராமரிப்பில் உள்ளது | தமிழ் இலக்கிய மன்றம்</title>
          <meta name="robots" content="noindex" />
        </Helmet>
      )}

      <div className="mt-card">
        <div className="mt-brand">
          <img src="/images/logo.png" alt="" />
          <span>தமிழ் இலக்கிய மன்றம்</span>
        </div>

        <Illustration />

        <h1 className="mt-title">{status.title || DEFAULT_TITLE}</h1>
        {!custom.title && <p className="mt-subtitle">{DEFAULT_TITLE_EN}</p>}

        <p className="mt-message">{status.message || DEFAULT_MESSAGE}</p>
        {!custom.message && <p className="mt-message mt-message-en">{DEFAULT_MESSAGE_EN}</p>}

        {status.reopensAt && (
          <div className="mt-reopen">
            <FaRegClock aria-hidden="true" />
            <div>
              <span className="mt-reopen-label">மீண்டும் திறக்கப்படும் நேரம் · Back at</span>
              <strong>{formatReopen(status.reopensAt)}</strong>
              {left && <small>இன்னும் {left}</small>}
            </div>
          </div>
        )}

        {links.length > 0 && (
          <ul className="mt-links">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
                  <Icon aria-hidden="true" /> {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
