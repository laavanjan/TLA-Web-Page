// /privacy — what the website stores about visitors, in plain words. Linked
// from the footer. Keep it in step with src/analytics and analytics.sql.
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaCheck, FaTimes } from "react-icons/fa";
import "./Privacy.css";

const COUNTED = [
  "Which page was opened, and when",
  "Where the visit came from (for example Google, Instagram or a QR code), and the name of a tagged link",
  "The kind of device (phone, computer or tablet), the browser and the operating system",
  "The country, worked out by our host from the connection",
  "Whether this browser has visited on an earlier day",
  "That a join application or book submission was sent (not what was written in it)",
];

const NOT_COUNTED = [
  "Your IP address",
  "Your name, email or phone number",
  "Anything that follows you from one day to the next: the random visit id changes every day",
  "Advertising or tracking cookies, or data shared with advertisers",
];

export default function Privacy() {
  return (
    <main className="pv">
      <Helmet>
        <title>Privacy | தமிழ் இலக்கிய மன்றம்</title>
        <meta name="description" content="What the Tamil Literary Association website counts about visits, and what it doesn't." />
      </Helmet>

      <header className="pv-head">
        <FaShieldAlt className="pv-head-icon" aria-hidden="true" />
        <h1>தனியுரிமை · Privacy</h1>
        <p>
          The Tamil Literary Association, University of Moratuwa, counts visits to this website so we know which pages
          and events people find useful. We keep it simple and anonymous.
        </p>
      </header>

      <section className="pv-section">
        <h2>What we count</h2>
        <ul className="pv-list is-yes">
          {COUNTED.map((t) => (
            <li key={t}>
              <FaCheck aria-hidden="true" /> {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="pv-section">
        <h2>What we never store</h2>
        <ul className="pv-list is-no">
          {NOT_COUNTED.map((t) => (
            <li key={t}>
              <FaTimes aria-hidden="true" /> {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="pv-section">
        <h2>Not counted at all</h2>
        <p>
          Visits are not counted if your browser sends <b>Do Not Track</b> or <b>Global Privacy Control</b>, if they come
          from search engine robots or link previews, or if they come from the association's own admin accounts.
        </p>
      </section>

      <section className="pv-section">
        <h2>How long we keep it</h2>
        <p>
          Individual page views are deleted after <b>90 days</b>. After that we only keep totals for each day (for
          example "120 visitors, 40 from Instagram"), which can't be traced back to anyone.
        </p>
        <p>
          The website keeps a random visit id in your browser's storage to count each visitor once a day. You can clear
          it at any time by clearing this site's data in your browser.
        </p>
      </section>

      <section className="pv-section">
        <h2>Forms</h2>
        <p>
          When you send a team join application or submit a book, what you type is sent to the association's committee
          for that purpose only. It is not part of the visit counts.
        </p>
      </section>

      <section className="pv-section">
        <h2>Questions</h2>
        <p>
          Ask us anything about this on the <Link to="/contact">contact page</Link>.
        </p>
      </section>
    </main>
  );
}
