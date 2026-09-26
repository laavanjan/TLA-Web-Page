import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaPhoneAlt,
  FaLinkedin,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaPlayCircle,
  FaInstagram,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import "./teamDetail.css";
import { SECTION_META } from "../sectionMeta";
import { SmartImage, LiteYouTube, InstagramEmbed, SocialIcons } from "./media";
import { youTubeId, instagramPost } from "../../../shared/mediaLinks";
import { competitionStatus, daysUntil } from "../../../shared/teamPages";

const formatDate = (date) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ta-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function TextSection({ s }) {
  const paras = s.text.split(/\n\s*\n/).filter((p) => p.trim());
  return (
    <>
      {paras.map((p, i) => (
        <p className="team-about-text" key={i}>
          {p}
        </p>
      ))}
      {s.buttonUrl && (
        <a className="team-text-btn" href={s.buttonUrl} target="_blank" rel="noopener noreferrer">
          {s.buttonLabel || "மேலும் அறிய"} <FaExternalLinkAlt />
        </a>
      )}
    </>
  );
}

function PeopleSection({ s }) {
  return (
    <div className="team-coordinator-grid">
      {s.people.map((c) => (
        <div className="team-coordinator-card" key={c.id}>
          <div className="team-person-head">
            <SmartImage
              src={c.photo}
              width={200}
              className="team-person-photo"
              alt={c.name}
              fallback={<span className="team-person-initial">{c.name.charAt(0)}</span>}
            />
            <div>
              <p className="team-coordinator-name">{c.name}</p>
              {c.role && <p className="team-coordinator-role">{c.role}</p>}
            </div>
          </div>
          <div className="team-person-links">
            {c.phone && (
              <a className="team-coordinator-phone" href={`tel:${c.phone.replace(/\s+/g, "")}`}>
                <FaPhoneAlt /> {c.phone}
              </a>
            )}
            {c.linkedin && (
              <a
                className="team-person-linkedin"
                href={c.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${c.name} on LinkedIn`}
              >
                <FaLinkedin />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineSection({ s }) {
  return (
    <div className="team-timeline">
      {s.items.map((t) => (
        <div className="team-timeline-item" key={t.id}>
          {t.year && <span className="team-timeline-year">{t.year}</span>}
          <span className="team-timeline-name">{t.text}</span>
        </div>
      ))}
    </div>
  );
}

function MembersSection({ s }) {
  return (
    <div className="team-member-grid">
      {s.names.map((name, i) => (
        <div className="team-member-chip" key={`${name}-${i}`}>
          <span className="team-member-avatar">{name.charAt(0)}</span>
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}

function YouTubeSection({ s }) {
  const ids = s.links.map(youTubeId).filter(Boolean);
  return (
    <div className={`team-yt-grid${ids.length === 1 ? " is-single" : ""}`}>
      {ids.map((id, i) => (
        <LiteYouTube key={`${id}-${i}`} id={id} title={`${s.title} ${i + 1}`} />
      ))}
    </div>
  );
}

function InstagramSection({ s }) {
  const posts = s.links.map(instagramPost).filter(Boolean);
  return (
    <div className="team-ig-grid">
      {posts.map((p, i) => (
        <div className="team-ig-item" key={`${p.code}-${i}`}>
          <InstagramEmbed post={p} />
          <a className="team-ig-open" href={p.url} target="_blank" rel="noopener noreferrer">
            <FaInstagram /> Instagram-இல் பார்க்க
          </a>
        </div>
      ))}
    </div>
  );
}

const STATUS_LABEL = {
  upcoming: "வரவிருக்கிறது",
  today: "இன்று!",
  completed: "நிறைவடைந்தது",
  tba: "திகதி விரைவில்",
};

function CompetitionCard({ c }) {
  const status = competitionStatus(c);
  const days = daysUntil(c.date);
  const medals = ["🥇", "🥈", "🥉"];
  const winners = c.winners.map((w, i) => ({ w, m: medals[i] })).filter((x) => x.w);
  const live = status !== "completed";

  return (
    <article className={`team-comp is-${status}`}>
      {c.poster && (
        <div className="team-comp-poster">
          <SmartImage src={c.poster} width={900} alt={c.name} />
        </div>
      )}
      <div className="team-comp-body">
        <div className="team-comp-meta">
          <span className={`team-comp-badge is-${status}`}>{STATUS_LABEL[status]}</span>
          {status === "upcoming" && (
            <span className="team-comp-countdown">
              இன்னும் <b>{days}</b> {days === 1 ? "நாள்" : "நாட்கள்"}
            </span>
          )}
        </div>
        <h3 className="team-comp-name">{c.name}</h3>
        {(c.date || c.venue) && (
          <p className="team-comp-info">
            {c.date && (
              <span>
                <FaCalendarAlt /> {formatDate(c.date)}
              </span>
            )}
            {c.venue && (
              <span>
                <FaMapMarkerAlt /> {c.venue}
              </span>
            )}
          </p>
        )}
        {c.description && <p className="team-comp-desc">{c.description}</p>}

        {!live && winners.length > 0 && (
          <div className="team-comp-winners">
            {winners.map(({ w, m }) => (
              <span className="team-comp-winner" key={m}>
                <span aria-hidden="true">{m}</span> {w}
              </span>
            ))}
          </div>
        )}

        <div className="team-comp-actions">
          {live && c.registerUrl && (
            <a className="team-comp-btn is-primary" href={c.registerUrl} target="_blank" rel="noopener noreferrer">
              பதிவு செய்ய <FaExternalLinkAlt />
            </a>
          )}
          {c.recordingUrl && (
            <a className="team-comp-btn" href={c.recordingUrl} target="_blank" rel="noopener noreferrer">
              <FaPlayCircle /> பதிவைப் பார்க்க
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function CompetitionsSection({ s }) {
  const withStatus = s.items.map((c) => ({ c, status: competitionStatus(c) }));
  const current = withStatus
    .filter((x) => x.status !== "completed")
    .sort((a, b) => (a.c.date || "9999").localeCompare(b.c.date || "9999"));
  const past = withStatus
    .filter((x) => x.status === "completed")
    .sort((a, b) => b.c.date.localeCompare(a.c.date));

  return (
    <div className="team-comps">
      {current.map(({ c }) => (
        <CompetitionCard key={c.id} c={c} />
      ))}
      {past.length > 0 && (
        <>
          {current.length > 0 && <h3 className="team-comp-subhead">கடந்த போட்டிகள்</h3>}
          {past.map(({ c }) => (
            <CompetitionCard key={c.id} c={c} />
          ))}
        </>
      )}
    </div>
  );
}

function GallerySection({ s }) {
  const [open, setOpen] = useState(-1);
  const count = s.images.length;

  useEffect(() => {
    if (open < 0) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(-1);
      if (e.key === "ArrowRight") setOpen((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setOpen((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, count]);

  return (
    <>
      <div className="team-gallery">
        {s.images.map((src, i) => (
          <button type="button" className="team-gallery-item" key={`${src}-${i}`} onClick={() => setOpen(i)}>
            <SmartImage src={src} width={800} alt={`${s.title} ${i + 1}`} />
          </button>
        ))}
      </div>
      {open >= 0 && (
        <div className="team-lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(-1)}>
          <button type="button" className="team-lightbox-close" aria-label="Close">
            <FaTimes />
          </button>
          {count > 1 && (
            <button
              type="button"
              className="team-lightbox-nav is-prev"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => (i - 1 + count) % count);
              }}
            >
              <FaChevronLeft />
            </button>
          )}
          <SmartImage
            src={s.images[open]}
            width={2000}
            alt={`${s.title} ${open + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {count > 1 && (
            <button
              type="button"
              className="team-lightbox-nav is-next"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => (i + 1) % count);
              }}
            >
              <FaChevronRight />
            </button>
          )}
          <span className="team-lightbox-count">
            {open + 1} / {count}
          </span>
        </div>
      )}
    </>
  );
}

const RENDERERS = {
  text: TextSection,
  people: PeopleSection,
  timeline: TimelineSection,
  members: MembersSection,
  youtube: YouTubeSection,
  instagram: InstagramSection,
  competitions: CompetitionsSection,
  gallery: GallerySection,
};

// Sections with nothing to show are skipped rather than rendered empty.
function hasContent(s) {
  switch (s.type) {
    case "text":
      return !!(s.text || s.buttonUrl);
    case "people":
      return s.people.length > 0;
    case "timeline":
    case "competitions":
      return s.items.length > 0;
    case "members":
      return s.names.length > 0;
    case "youtube":
      return s.links.some(youTubeId);
    case "instagram":
      return s.links.some(instagramPost);
    case "gallery":
      return s.images.length > 0;
    default:
      return false;
  }
}

const TeamDetail = ({ page, preview = false }) => {
  if (!page) {
    return (
      <div className="team-detail-page">
        <div className="team-not-found">
          <h2>அணி காணப்படவில்லை</h2>
          <p>கோரப்பட்ட அணி இங்கு இல்லை. அணிகள் பட்டியலுக்குத் திரும்பவும்.</p>
          <Link to="/teams" className="team-back-btn">
            <FaArrowLeft /> அணிகளுக்குத் திரும்ப
          </Link>
        </div>
      </div>
    );
  }

  const sections = page.sections.filter((s) => !s.hidden && hasContent(s));
  const jump = (id) => {
    const el = document.getElementById(`team-sec-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="team-detail-page">
      <div className={`team-hero${page.banner ? " has-banner" : ""}`}>
        {page.banner && (
          <>
            <SmartImage src={page.banner} width={2000} alt="" className="team-hero-banner" />
            <div className="team-hero-shade" aria-hidden="true" />
          </>
        )}
        {preview ? (
          <span className="team-hero-back">
            <FaArrowLeft /> அணிகளுக்குத் திரும்ப
          </span>
        ) : (
          <Link to="/teams" className="team-hero-back">
            <FaArrowLeft /> அணிகளுக்குத் திரும்ப
          </Link>
        )}
        {page.logo && (
          <div className="team-hero-logo">
            <SmartImage
              src={page.logo}
              width={320}
              alt={`${page.title} logo`}
              fallback={<span>{page.title.charAt(0)}</span>}
            />
          </div>
        )}
        <h1 className="team-hero-title">{page.title}</h1>
        {page.tagline && <p className="team-hero-tagline">{page.tagline}</p>}
        <SocialIcons links={page.socials || []} />
      </div>

      <div className="team-detail-body">
        {(page.cover || page.fallbackPhoto) && (
          <div className="team-photo-card">
            <SmartImage
              src={page.cover}
              alt={`${page.title} புகைப்படம்`}
              fallback={page.fallbackPhoto ? <img src={page.fallbackPhoto} alt={`${page.title} புகைப்படம்`} /> : null}
            />
          </div>
        )}

        {sections.length >= 3 && (
          <nav className="team-nav" aria-label="Sections">
            {sections.map((s) => {
              const Icon = SECTION_META[s.type].icon;
              return (
                <button type="button" key={s.id} onClick={() => jump(s.id)}>
                  <Icon /> {s.title || SECTION_META[s.type].label}
                </button>
              );
            })}
          </nav>
        )}

        {sections.map((s) => {
          const Body = RENDERERS[s.type];
          const Icon = SECTION_META[s.type].icon;
          return (
            <section className={`team-section team-section-${s.type}`} id={`team-sec-${s.id}`} key={s.id}>
              {s.title && (
                <h2 className="team-section-title">
                  <Icon className="team-section-icon" /> {s.title}
                </h2>
              )}
              <Body s={s} />
            </section>
          );
        })}

        {!preview && (
          <div className="team-cta">
            <Link to="/teams" className="team-cta-btn">
              மற்ற அணிகளைப் பார்வையிட
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetail;
