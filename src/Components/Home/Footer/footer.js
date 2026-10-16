// The site footer (every public page): TLA's name and motto, quick links to
// the pages and events, the contact details from /admin/contact, and the
// copyright line. A faint kolam behind it draws itself as the footer scrolls
// into view (the same one as the home page intro).
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArrowUp,
  FaUsers,
  FaFeatherAlt,
} from "react-icons/fa";
import Logo from "../../../images/Logo-Nav/logo.png";
import Kolam from "../Intro/Kolam";
import { fetchContactConfig, getCachedContactConfig } from "../../../shared/contactConfig";
import { useScrollVar, rangeProgress } from "../../../shared/scrollFx/scrollFx";
import "./footer.css";

const PAGES = [
  ["முகப்பு", "/"],
  ["எமது வரலாறு", "/history"],
  ["நூல்கள்", "/books"],
  ["அணிகள்", "/teams"],
  ["உறுப்பினர்கள்", "/members"],
  ["தொடர்புகள்", "/contact"],
];

const EVENTS = [
  ["தமிழருவி", "/events/thamilaruvi"],
  ["சொற்கணை", "/events/sotkanai"],
  ["பிரம்மம்", "/events/brammam"],
  ["நிரலி", "/ideathon"],
  ["ஜீவநதி", "/events/jeevanathi"],
  ["தைப்பொங்கல்", "/events/thaipongal"],
];

// The kolam is drawn by the time the footer's top is a third of the way up the screen.
const drawProgress = rangeProgress("top", 1, 0.35);

function Footer() {
  const ref = useRef(null);
  const [contact, setContact] = useState(getCachedContactConfig);
  useScrollVar(ref, drawProgress, { name: "--k" });

  useEffect(() => {
    let alive = true;
    fetchContactConfig()
      .then((c) => alive && setContact(c))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const year = new Date().getFullYear();
  const tel = (contact.phoneNumber || "").replace(/[^\d+]/g, "");
  const socials = [
    [contact.facebookUrl, "Facebook", FaFacebookF],
    [contact.youtubeUrl, "YouTube", FaYoutube],
    [contact.instagramUrl, "Instagram", FaInstagram],
  ].filter(([url]) => url);

  return (
    <footer ref={ref} className="ft">
      <Kolam className="ft-kolam" />
      <div className="ft-glow" aria-hidden="true" />

      <div className="ft-inner">
        <div className="ft-brand">
          <Link to="/" className="ft-logo-row" aria-label="தமிழ் இலக்கிய மன்றம் - முகப்பு">
            <span className="ft-logo">
              <img src={Logo} alt="" />
            </span>
            <span className="ft-name-wrap">
              <span className="ft-name">தமிழ் இலக்கிய மன்றம்</span>
              <span className="ft-uni">மொறட்டுவைப் பல்கலைக்கழகம் · 1968 முதல்</span>
            </span>
          </Link>
          <div className="ft-about">
            இலத்திரனியல் யுகத்தில் இலக்கியம் காக்க, மொறட்டுவைத் தமிழ் மாணவர்களால் இயங்கும் மன்றம் - கலை, இலக்கியம், சமூகப் பணி என
            ஐந்து தசாப்தங்களாக.
          </div>
          <div className="ft-motto">“தமிழுக்காய் நாம் ! நமக்கேயான தமிழ் !!”</div>
          {socials.length > 0 && (
            <div className="ft-social">
              {socials.map(([url, name, Icon]) => (
                <a key={name} href={url} className="ft-social-btn" target="_blank" rel="noopener noreferrer" aria-label={name} title={name}>
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav className="ft-col" aria-label="பக்கங்கள்">
          <span className="ft-head">பக்கங்கள்</span>
          <ul>
            {PAGES.map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="ft-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="ft-col" aria-label="நிகழ்வுகள்">
          <span className="ft-head">நிகழ்வுகள்</span>
          <ul>
            {EVENTS.map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="ft-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ft-col ft-contact">
          <span className="ft-head">தொடர்பு கொள்ள</span>
          <ul>
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="ft-link ft-detail">
                  <FaEnvelope aria-hidden="true" />
                  <span>{contact.email}</span>
                </a>
              </li>
            )}
            {contact.phoneNumber && (
              <li>
                <a href={`tel:${tel}`} className="ft-link ft-detail">
                  <FaPhoneAlt aria-hidden="true" />
                  <span>
                    {contact.phoneNumber}
                    {contact.phoneName ? <small> · {contact.phoneName}</small> : null}
                  </span>
                </a>
              </li>
            )}
            <li>
              <span className="ft-detail">
                <FaMapMarkerAlt aria-hidden="true" />
                <span>மொறட்டுவைப் பல்கலைக்கழகம், கட்டுபெத்தை, இலங்கை</span>
              </span>
            </li>
          </ul>
          <div className="ft-cta">
            <Link to="/teams/join" className="ft-btn is-primary">
              <FaUsers aria-hidden="true" /> அணியில் இணையுங்கள்
            </Link>
            <Link to="/books/submit" className="ft-btn">
              <FaFeatherAlt aria-hidden="true" /> படைப்பைச் சமர்ப்பிக்க
            </Link>
          </div>
        </div>
      </div>

      <div className="ft-bottom">
        <div className="ft-bottom-inner">
          <span className="ft-copy">
            © {year} தமிழ் இலக்கிய மன்றம் · அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை
            <span className="ft-copy-en">Tamil Literary Association, University of Moratuwa</span>
          </span>
          <button type="button" className="ft-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            மேலே செல்ல <FaArrowUp aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
