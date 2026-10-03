import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { youTubeId, instagramPost, imageCandidates, socialPlatform } from "../../../shared/mediaLinks";
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

// Phone numbers only show for the current year's coordinators; people from
// past years keep their name, role, photo and LinkedIn.
function PeopleGrid({ people, showPhone }) {
  return (
    <div className="team-coordinator-grid">
      {people.map((c) => (
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
            {showPhone && c.phone && (
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

function MembersGrid({ names }) {
  return (
    <div className="team-member-grid">
      {names.map((name, i) => (
        <div className="team-member-chip" key={`${name}-${i}`}>
          <span className="team-member-avatar">{name.charAt(0)}</span>
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}

const hasTeam = (y) => y.people.length > 0 || y.members.length > 0;

// "Team by year": year pills (newest = current), that year's coordinators and
// members, then a list of every earlier year's coordinators that also works
// as a shortcut to that year.
function YearsSection({ s }) {
  const years = s.years.filter(hasTeam);
  const [sel, setSel] = useState(0);
  const top = useRef(null);
  const idx = Math.min(sel, years.length - 1);
  const year = years[idx];
  const past = years.slice(1).filter((y) => y.people.length);

  const pick = (i) => {
    setSel(i);
    if (top.current && top.current.getBoundingClientRect().top < 0) {
      top.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="team-years" ref={top}>
      {years.length > 1 && (
        <div className="team-year-pills" role="tablist" aria-label="Year">
          {years.map((y, i) => (
            <button
              type="button"
              role="tab"
              key={y.id}
              aria-selected={i === idx}
              className={`team-year-pill${i === idx ? " is-active" : ""}`}
              onClick={() => pick(i)}
            >
              {y.year}
              {i === 0 && <span className="team-year-now">தற்போது</span>}
            </button>
          ))}
        </div>
      )}

      <div className="team-year" key={year.id} role="tabpanel" aria-label={year.year}>
        {years.length === 1 && <p className="team-year-label">{year.year}</p>}
        {year.people.length > 0 && (
          <>
            <h3 className="team-year-sub">ஒருங்கிணைப்பாளர்கள்</h3>
            <PeopleGrid people={year.people} showPhone={idx === 0} />
          </>
        )}
        {year.members.length > 0 && (
          <>
            <h3 className="team-year-sub">
              உறுப்பினர்கள் <span>{year.members.length}</span>
            </h3>
            <MembersGrid names={year.members} />
          </>
        )}
      </div>

      {past.length > 0 && (
        <div className="team-past">
          <h3 className="team-year-sub">முன்னாள் ஒருங்கிணைப்பாளர்கள்</h3>
          <div className="team-timeline">
            {past.map((y) => {
              const i = years.indexOf(y);
              return (
                <button
                  type="button"
                  key={y.id}
                  className={`team-timeline-item team-past-item${i === idx ? " is-active" : ""}`}
                  onClick={() => pick(i)}
                  aria-label={`${y.year}: show that year's team`}
                >
                  <span className="team-timeline-year">{y.year}</span>
                  <span className="team-timeline-name">{y.people.map((p) => p.name).join(" · ")}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const YT_ROWS = 2;

// Two rows of videos, then "show more" reveals two more rows at a time. How
// many fit in a row depends on the screen, so it's read from the grid itself.
function YouTubeSection({ s }) {
  const ids = s.links.map(youTubeId).filter(Boolean);
  const grid = useRef(null);
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(YT_ROWS);

  useEffect(() => {
    const el = grid.current;
    if (!el) return undefined;
    const measure = () => setCols(getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length || 1);
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visible = ids.slice(0, cols * rows);
  const remaining = ids.length - visible.length;

  return (
    <>
      <div ref={grid} className={`team-yt-grid${ids.length === 1 ? " is-single" : ""}`}>
        {visible.map((id, i) => (
          <LiteYouTube key={`${id}-${i}`} id={id} title={`${s.title} ${i + 1}`} />
        ))}
      </div>
      {remaining > 0 && (
        <div className="team-gallery-more">
          <button type="button" onClick={() => setRows((r) => r + YT_ROWS)}>
            மேலும் காணொளிகள் <span>({remaining})</span>
          </button>
        </div>
      )}
    </>
  );
}

// Posts sit side by side in one row: swipe on phones (the next post peeks in),
// arrows on desktop. Each post snaps into place.
function InstagramSection({ s, page }) {
  const posts = s.links.map(instagramPost).filter(Boolean);
  const track = useRef(null);
  const [state, setState] = useState({ first: 1, last: 1, prev: false, next: false });
  const follow = ((page && page.socials) || []).find((u) => socialPlatform(u) === "instagram");

  // Which posts are (mostly) on screen, for the "2-3 / 5" counter.
  const update = useCallback(() => {
    const el = track.current;
    if (!el || !el.firstElementChild) return;
    const box = el.getBoundingClientRect();
    const shown = [];
    [...el.children].forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const seen = Math.min(r.right, box.right) - Math.max(r.left, box.left);
      if (seen >= r.width * 0.6) shown.push(i + 1);
    });
    const next = {
      first: shown[0] || 1,
      last: shown[shown.length - 1] || 1,
      prev: el.scrollLeft > 4,
      next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    };
    setState((cur) =>
      cur.first === next.first && cur.last === next.last && cur.prev === next.prev && cur.next === next.next ? cur : next
    );
  }, []);

  useEffect(() => {
    const el = track.current;
    update();
    if (!el) return undefined;
    el.addEventListener("scrollend", update);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro) ro.observe(el);
    return () => {
      el.removeEventListener("scrollend", update);
      if (ro) ro.disconnect();
    };
  }, [update, posts.length]);

  const slide = (dir) => {
    const el = track.current;
    const card = el && el.firstElementChild;
    if (!card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0)), behavior: "smooth" });
    setTimeout(update, 500); // in case the browser skips the final scroll event
  };

  const scrollable = state.prev || state.next;

  return (
    <div className="team-ig">
      {(scrollable || follow) && (
        <div className="team-ig-bar">
          {scrollable && (
            <span className="team-ig-count" aria-live="polite">
              {state.first === state.last ? state.first : `${state.first}-${state.last}`} / {posts.length}
            </span>
          )}
          {follow && (
            <a className="team-ig-follow" href={follow} target="_blank" rel="noopener noreferrer">
              <FaInstagram /> Instagram-இல் பின்தொடர
            </a>
          )}
        </div>
      )}
      <div className="team-ig-viewport">
        {state.prev && (
          <button type="button" className="team-ig-arrow is-prev" onClick={() => slide(-1)} aria-label="Previous posts">
            <FaChevronLeft />
          </button>
        )}
        <div className="team-ig-track" ref={track} onScroll={update}>
          {posts.map((p, i) => (
            <div className="team-ig-item" key={`${p.code}-${i}`}>
              <InstagramEmbed post={p} />
            </div>
          ))}
        </div>
        {state.next && (
          <button type="button" className="team-ig-arrow is-next" onClick={() => slide(1)} aria-label="Next posts">
            <FaChevronRight />
          </button>
        )}
      </div>
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

const GALLERY_PAGE = 12;
const THUMB_WIDTHS = [320, 480, 720, 960];
// Square thumbnails cropped by Cloudinary around faces/subjects (g_auto).
const THUMB_CROP = "c_fill,g_auto,ar_1:1";
// Small photos may be enlarged in the lightbox, but only this much — beyond
// that they turn to mush.
const MAX_UPSCALE = 2;

// One full-size URL per screen. A srcset can't be used here: its width
// descriptors would claim e.g. 2000px for a 400px photo (Cloudinary never
// upscales), and the browser would then draw that photo even smaller.
const fullWidth = () => Math.min(2560, Math.round(window.innerWidth * (window.devicePixelRatio || 1)));

function Lightbox({ images, index, title, onIndex, onClose }) {
  const count = images.length;
  const img = images[index];
  const closeRef = useRef(null);
  const touch = useRef(null);
  // Real pixel size: saved at upload, or read from the file once it loads.
  const [loaded, setLoaded] = useState({});
  const dims = img.width && img.height ? { w: img.width, h: img.height } : loaded[img.id];
  // Tracks the index between renders so several quick key presses each move.
  const at = useRef(index);
  at.current = index;
  const go = (d) => {
    at.current = (at.current + d + count) % count;
    onIndex(at.current);
  };
  // Latest values for the window listener, which is attached once.
  const live = useRef({});
  live.current = { go, onClose };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") live.current.onClose();
      if (e.key === "ArrowRight") live.current.go(1);
      if (e.key === "ArrowLeft") live.current.go(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (closeRef.current) closeRef.current.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  // Warm the cache for the neighbours so next/previous feels instant.
  useEffect(() => {
    if (count < 2) return;
    [index + 1, index - 1].forEach((i) => {
      const n = images[(i + count) % count];
      const [url] = imageCandidates(n.url, fullWidth());
      if (url) new Image().src = url;
    });
  }, [index, images, count]);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (count > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) onClose(); // swipe down to close
  };

  const stop = (e) => e.stopPropagation();

  // Portalled to <body>: .team-detail-body is its own stacking context, which
  // would otherwise leave the site's fixed navbar drawn on top of the overlay.
  return createPortal(
    <div
      className="team-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} - ${index + 1} / ${count}`}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button type="button" ref={closeRef} className="team-lightbox-close" aria-label="Close" onClick={onClose}>
        <FaTimes />
      </button>
      {count > 1 && (
        <button
          type="button"
          className="team-lightbox-nav is-prev"
          aria-label="Previous"
          onClick={(e) => {
            stop(e);
            go(-1);
          }}
        >
          <FaChevronLeft />
        </button>
      )}
      <figure className="team-lightbox-figure" onClick={stop}>
        <SmartImage
          key={img.id}
          src={img.url}
          width={fullWidth()}
          loading="eager"
          alt={img.caption || `${title} ${index + 1}`}
          className={dims ? "is-sized" : undefined}
          style={dims ? { "--max-w": `${dims.w * MAX_UPSCALE}px`, "--ratio": dims.w / dims.h } : undefined}
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            if (w && h && !loaded[img.id]) setLoaded((m) => ({ ...m, [img.id]: { w, h } }));
          }}
        />
        {img.caption && <figcaption>{img.caption}</figcaption>}
      </figure>
      {count > 1 && (
        <button
          type="button"
          className="team-lightbox-nav is-next"
          aria-label="Next"
          onClick={(e) => {
            stop(e);
            go(1);
          }}
        >
          <FaChevronRight />
        </button>
      )}
      {count > 1 && (
        <span className="team-lightbox-count" aria-live="polite">
          {index + 1} / {count}
        </span>
      )}
    </div>,
    document.body
  );
}

function GallerySection({ s }) {
  const [open, setOpen] = useState(-1);
  const [shown, setShown] = useState(GALLERY_PAGE);
  const tiles = useRef([]);
  const count = s.images.length;
  const visible = s.images.slice(0, shown);
  const remaining = count - visible.length;
  const featured = count >= 5;

  const close = () => {
    const el = tiles.current[open]; // hand focus back to the photo that was open
    setOpen(-1);
    if (el) setTimeout(() => el.focus(), 0);
  };

  const onIndex = (n) => {
    setOpen(n);
    // Browsing past the visible grid in the lightbox reveals those photos too,
    // so closing lands on a tile that exists.
    if (n >= shown) setShown(Math.ceil((n + 1) / GALLERY_PAGE) * GALLERY_PAGE);
  };

  return (
    <>
      <div className={`team-gallery${featured ? " is-featured" : ""}`}>
        {visible.map((img, i) => (
          <button
            type="button"
            className="team-gallery-item"
            key={img.id}
            ref={(el) => {
              tiles.current[i] = el;
            }}
            onClick={() => setOpen(i)}
            aria-label={img.caption || `${s.title} ${i + 1}`}
          >
            <SmartImage
              src={img.url}
              width={featured && i === 0 ? 1200 : 720}
              widths={THUMB_WIDTHS}
              crop={THUMB_CROP}
              sizes={featured && i === 0 ? "(max-width: 700px) 100vw, 640px" : "(max-width: 700px) 50vw, 320px"}
              alt=""
              onLoad={(e) => e.currentTarget.classList.add("is-loaded")}
            />
            {img.caption && <span className="team-gallery-caption">{img.caption}</span>}
          </button>
        ))}
      </div>
      {remaining > 0 && (
        <div className="team-gallery-more">
          <button type="button" onClick={() => setShown((n) => n + GALLERY_PAGE)}>
            மேலும் {Math.min(remaining, GALLERY_PAGE)} படங்கள் <span>({remaining})</span>
          </button>
        </div>
      )}
      {open >= 0 && open < count && (
        <Lightbox images={s.images} index={open} title={s.title} onIndex={onIndex} onClose={close} />
      )}
    </>
  );
}

const RENDERERS = {
  text: TextSection,
  years: YearsSection,
  timeline: TimelineSection,
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
    case "years":
      return s.years.some(hasTeam);
    case "timeline":
    case "competitions":
      return s.items.length > 0;
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
              <Body s={s} page={page} />
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
