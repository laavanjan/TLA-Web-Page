// The section types that only event pages have (programme, winners, rules,
// cards, sponsors, contacts, key details, past years and the built-in
// server-driven blocks). Gallery, text, YouTube, Instagram, milestones and
// competitions reuse the renderers from the team pages.
import React, { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt, FaPhoneAlt, FaEnvelope, FaChevronDown, FaPlayCircle } from "react-icons/fa";
import { SmartImage, LiteYouTube } from "../teams/team-detail/media";
import { GallerySection } from "../teams/team-detail/TeamDetail";
import { youTubeId } from "../../shared/mediaLinks";

const paragraphs = (text) => String(text || "").split(/\n\s*\n/).filter((p) => p.trim());

// An in-site path becomes a router link; anything else opens in a new tab.
export function ActionLink({ url, className, children }) {
  if (!url) return null;
  if (url.startsWith("/")) {
    return (
      <Link to={url} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={url} className={className} target="_blank" rel="noopener noreferrer">
      {children} <FaExternalLinkAlt />
    </a>
  );
}

// ---- Programme ----------------------------------------------------------------------

export function AgendaSection({ s }) {
  const facts = [
    ["திகதி", s.date],
    ["நேரம்", s.time],
    ["இடம்", s.venue],
  ].filter(([, v]) => v);
  const invite = s.lead || s.heading || facts.length;

  return (
    <div className="evx-agenda">
      {invite && (
        <div className="evx-invite">
          {s.lead && <p className="evx-invite-lead">{s.lead}</p>}
          {s.heading && <h3 className="evx-invite-heading">{s.heading}</h3>}
          {facts.length > 0 && (
            <dl className="evx-invite-facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
      {s.items.length > 0 && (
        <ol className="evx-programme">
          {s.items.map((a) => (
            <li key={a.id}>
              {a.time && <span className="evx-programme-time">{a.time}</span>}
              <div>
                <strong>{a.title}</strong>
                {a.detail && <p>{a.detail}</p>}
                <ActionLink url={a.linkUrl} className="evx-link">
                  {a.linkLabel || "மேலும் அறிய"}
                </ActionLink>
              </div>
            </li>
          ))}
        </ol>
      )}
      {s.images.length > 0 && (
        <div className="evx-posters">
          {s.images.map((img) => (
            <SmartImage key={img.id} src={img.url} width={900} alt={img.caption || s.heading || s.title} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Sponsors ---------------------------------------------------------------------------

export function SponsorsSection({ s }) {
  return (
    <div className="evx-sponsors">
      {s.items.map((x) => {
        const body = (
          <>
            {x.tier && <span className="evx-sponsor-tier">{x.tier}</span>}
            {x.logo && (
              <div className="evx-sponsor-logo">
                <SmartImage src={x.logo} width={500} alt={x.name} fallback={<b>{x.name.charAt(0)}</b>} />
              </div>
            )}
            {x.name && <strong>{x.name}</strong>}
            {x.text && <p>{x.text}</p>}
          </>
        );
        return x.url ? (
          <a key={x.id} className="evx-sponsor" href={x.url} target="_blank" rel="noopener noreferrer">
            {body}
          </a>
        ) : (
          <div key={x.id} className="evx-sponsor">
            {body}
          </div>
        );
      })}
    </div>
  );
}

// ---- Winners & prizes --------------------------------------------------------------------

export function AwardsSection({ s }) {
  return (
    <div className="evx-awards">
      {s.items.map((a) => (
        <div key={a.id} className="evx-award">
          {a.image && (
            <div className="evx-award-img">
              <SmartImage src={a.image} width={400} alt={a.place || a.name} />
            </div>
          )}
          {a.place && <span className="evx-award-place">{a.place}</span>}
          {a.name && <strong>{a.name}</strong>}
          {a.detail && <p>{a.detail}</p>}
        </div>
      ))}
    </div>
  );
}

// ---- Rules -----------------------------------------------------------------------------------

export function RulesSection({ s }) {
  const [open, setOpen] = useState(!s.collapsible);
  const list = (
    <ol className="evx-rules">
      {s.items.map((r) => (
        <li key={r.id}>{r.text}</li>
      ))}
    </ol>
  );
  if (!s.collapsible) return list;
  return (
    <>
      <div className="evx-rules-bar">
        <button type="button" className={`evx-rules-toggle${open ? " is-open" : ""}`} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {s.buttonLabel || s.title || "விதிமுறைகள்"} <FaChevronDown />
        </button>
      </div>
      {open && list}
    </>
  );
}

// ---- Cards ------------------------------------------------------------------------------------

export function CardsSection({ s }) {
  return (
    <div className="evx-cards">
      {s.items.map((c) => (
        <article key={c.id} className="evx-cardx">
          {c.image && (
            <div className="evx-cardx-img">
              <SmartImage src={c.image} width={700} alt={c.title} />
            </div>
          )}
          <div className="evx-cardx-body">
            {c.title && <h3>{c.title}</h3>}
            {paragraphs(c.text).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {c.images.length > 0 && <GallerySection s={{ title: c.title, images: c.images }} />}
            <ActionLink url={c.url} className="evx-link evx-link-solid">
              {c.urlLabel || "மேலும் அறிய"}
            </ActionLink>
          </div>
        </article>
      ))}
    </div>
  );
}

// ---- Contacts & key details --------------------------------------------------------------------

export function ContactsSection({ s }) {
  return (
    <>
      <div className="evx-contacts">
        {s.items.map((c) => (
          <div key={c.id} className="evx-contact">
            <strong>{c.name}</strong>
            {c.role && <span className="evx-contact-role">{c.role}</span>}
            {c.phone && (
              <a href={`tel:${c.phone.replace(/\s+/g, "")}`}>
                <FaPhoneAlt /> {c.phone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`}>
                <FaEnvelope /> {c.email}
              </a>
            )}
          </div>
        ))}
      </div>
      {s.note && <p className="evx-note">{s.note}</p>}
    </>
  );
}

export function FactsSection({ s }) {
  return (
    <>
      {s.note && <p className="evx-facts-lead">{s.note}</p>}
      <dl className="evx-facts">
        {s.items.map((f) => (
          <div key={f.id}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

// ---- Past years ---------------------------------------------------------------------------------

const yearOf = (e) => (/^\d{4}$/.test(e.year) ? Number(e.year) : -1);

export function EditionsSection({ s }) {
  const items = [...s.items].sort((a, b) => yearOf(b) - yearOf(a));
  const [sel, setSel] = useState(0);
  const ed = items[Math.min(sel, items.length - 1)];
  const video = youTubeId(ed.videoUrl);

  return (
    <div className="evx-editions">
      {items.length > 1 && (
        <div className="team-year-pills" role="tablist" aria-label="Year">
          {items.map((e, i) => (
            <button
              type="button"
              role="tab"
              key={e.id}
              aria-selected={e === ed}
              className={`team-year-pill${e === ed ? " is-active" : ""}`}
              onClick={() => setSel(i)}
            >
              {e.year}
            </button>
          ))}
        </div>
      )}
      <div key={ed.id} className="evx-edition" role="tabpanel" aria-label={ed.year}>
        {(ed.title || items.length === 1) && (
          <h3 className="evx-edition-title">
            {items.length === 1 && <span>{ed.year}</span>} {ed.title}
          </h3>
        )}
        {paragraphs(ed.text).map((p, i) => (
          <p className="team-about-text" key={i}>
            {p}
          </p>
        ))}
        {video ? (
          <div className="evx-edition-video">
            <LiteYouTube id={video} title={ed.title || ed.year} />
          </div>
        ) : (
          ed.videoUrl && (
            <ActionLink url={ed.videoUrl} className="evx-link evx-link-solid">
              <FaPlayCircle /> பதிவைப் பார்க்க
            </ActionLink>
          )
        )}
        {ed.images.length > 0 && <GallerySection s={{ title: ed.title || ed.year, images: ed.images }} />}
      </div>
    </div>
  );
}

// ---- Built-in, server-driven blocks ----------------------------------------------------------------

// Loaded on demand: most event pages never need any of these.
const LIVE = {
  "sotkanai-districts": lazy(() => import("./sotkanai/gallery/MainGalleryComponent")),
  "aramiyam-seminars": lazy(() => import("./aramiyam/seminar/Seminar")),
  "ideathon-agenda": lazy(() => import("./hackthon/agenda/Agenda")),
  "ideathon-rules": lazy(() => import("./hackthon/RulesButton/RulesButton")),
  "brammam-about": lazy(() => import("./brammam/aboutEvent/BrammamEventAbout")),
};

export function LiveSection({ s }) {
  const Block = LIVE[s.block];
  if (!Block) return null;
  return (
    <Suspense fallback={<div className="evx-live-loading" aria-hidden="true" />}>
      <Block />
    </Suspense>
  );
}
