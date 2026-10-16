// "TLA உதவி" - a pick-a-question assistant shown on every public page.
// No AI and no API keys: visitors choose a topic or search, tap a question,
// and get the prepared answer (the `faqs` table, edited at /admin/faq) as a
// chat reply, with links to the right page and related questions to try next.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaCommentDots, FaTimes, FaSearch, FaRedoAlt, FaArrowRight, FaExternalLinkAlt, FaChevronUp } from "react-icons/fa";
import {
  useFaqs,
  useFaqContext,
  fillTokens as fill,
  FAQ_CATEGORIES,
  BUILT_IN_FAQS,
  POPULAR_IDS as POPULAR,
  NOT_FOUND_ID,
} from "../../shared/faq/faqs";
import "./helpBot.css";

const CATEGORIES = [{ id: "popular", label: "பிரபலமானவை" }, ...FAQ_CATEGORIES];
const CAT_LABEL = Object.fromEntries(FAQ_CATEGORIES.map((c) => [c.id, c.label]));
// What "எம்மைத் தொடர்பு கொள்ள" answers when a search finds nothing; the
// built-in copy if admins removed it.
const BUILT_IN_NOT_FOUND = BUILT_IN_FAQS.find((f) => f.id === NOT_FOUND_ID);
const TYPING_MS = 450;

const reducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFC");

// Every typed word must appear in the question, its topic or its search words.
function searchFaqs(faqs, query) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return faqs.filter((f) => {
    const hay = norm(`${f.q} ${CAT_LABEL[f.cat]} ${f.kw || ""}`);
    return words.every((w) => hay.includes(w));
  });
}

// The popular picks that still exist, or the first few questions if none do.
function questionsFor(faqs, byId, cat) {
  if (cat !== "popular") return faqs.filter((f) => f.cat === cat);
  const picks = POPULAR.map((id) => byId.get(id)).filter(Boolean);
  return picks.length ? picks : faqs.slice(0, POPULAR.length);
}

export default function HelpBot() {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState("popular");
  const [query, setQuery] = useState("");
  // [{ key, faq, answered }]; holds the question itself, so a list refreshed
  // from the database can't pull an answer out from under the chat.
  const [thread, setThread] = useState([]);
  // The question list folds away once a question is asked, so the answer has room.
  const [listOpen, setListOpen] = useState(true);
  const bodyRef = useRef(null);
  const searchRef = useRef(null);
  const keySeq = useRef(0);

  // The questions, contact details and member count are fetched the first time it opens.
  const faqs = useFaqs(open);
  const ctx = useFaqContext(open);
  const byId = useMemo(() => new Map(faqs.map((f) => [f.id, f])), [faqs]);
  // Topics with no questions left are left out.
  const categories = useMemo(() => CATEGORIES.filter((c) => c.id === "popular" || faqs.some((f) => f.cat === c.id)), [faqs]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => searchRef.current && searchRef.current.focus({ preventScroll: true }), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [thread, open]);

  // An answer "types" for a moment so it reads like a reply.
  useEffect(() => {
    const pending = thread.find((m) => !m.answered);
    if (!pending) return undefined;
    const t = setTimeout(
      () => setThread((cur) => cur.map((m) => (m.key === pending.key ? { ...m, answered: true } : m))),
      reducedMotion() ? 0 : TYPING_MS,
    );
    return () => clearTimeout(t);
  }, [thread]);

  const ask = (faq) => {
    if (!faq || thread.some((m) => !m.answered)) return;
    keySeq.current += 1;
    setThread((cur) => [...cur, { key: keySeq.current, faq, answered: false }]);
    setQuery("");
    setListOpen(false);
  };

  const reset = () => {
    setThread([]);
    setQuery("");
    setCat("popular");
    setListOpen(true);
  };

  const found = searchFaqs(faqs, query);
  const activeCat = categories.some((c) => c.id === cat) ? cat : "popular";
  const list = found || questionsFor(faqs, byId, activeCat);
  const asked = new Set(thread.map((m) => m.faq.id));
  const last = thread[thread.length - 1];
  const related =
    last && last.answered ? faqs.filter((f) => f.cat === last.faq.cat && !asked.has(f.id)).slice(0, 3) : [];
  const busy = thread.some((m) => !m.answered);

  const renderLink = (l, i) => {
    const label = fill(l.label, ctx);
    if (l.to) {
      return (
        <Link key={i} to={l.to} className="hb-link" onClick={() => setOpen(false)}>
          {label} <FaArrowRight />
        </Link>
      );
    }
    const href = fill(l.href, ctx);
    if (/\{\w+\}/.test(href) || !/^(https?:|mailto:|tel:)/i.test(href)) return null;
    return (
      <a
        key={i}
        href={href}
        className="hb-link"
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noopener noreferrer"
      >
        {label} <FaExternalLinkAlt />
      </a>
    );
  };

  return (
    <>
      <button
        type="button"
        className={`hb-launcher ${open ? "is-hidden" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="TLA உதவி - கேள்விகளுக்குப் பதில்கள்"
        aria-expanded={open}
      >
        <FaCommentDots />
        <span className="hb-launcher-label">உதவி</span>
      </button>

      {open && (
        <div className="hb-panel" role="dialog" aria-label="TLA உதவி">
          <div className="hb-head">
            <span className="hb-avatar" aria-hidden="true">
              த
            </span>
            <div className="hb-head-text">
              <span className="hb-title">TLA உதவி</span>
              <span className="hb-sub">கேள்வியைத் தெரிவு செய்யுங்கள் - உடனே பதில்</span>
            </div>
            {thread.length > 0 && (
              <button type="button" className="hb-icon" onClick={reset} aria-label="மீண்டும் தொடங்கு" title="மீண்டும் தொடங்கு">
                <FaRedoAlt />
              </button>
            )}
            <button type="button" className="hb-icon" onClick={() => setOpen(false)} aria-label="மூடு" title="மூடு">
              <FaTimes />
            </button>
          </div>

          <div className="hb-body" ref={bodyRef} aria-live="polite">
            <div className="hb-msg is-bot">
              <div className="hb-bubble">
                வணக்கம்! 🙏 தமிழ் இலக்கிய மன்றம் பற்றி அறிய விரும்புவதைக் கீழே தெரிவு செய்யுங்கள், அல்லது தேடுங்கள்.
              </div>
            </div>

            {thread.map((m) => {
              const f = m.faq;
              return (
                <React.Fragment key={m.key}>
                  <div className="hb-msg is-user">
                    <div className="hb-bubble">{f.q}</div>
                  </div>
                  <div className="hb-msg is-bot">
                    {m.answered ? (
                      <div className="hb-bubble">
                        <div className="hb-answer">{fill(f.a, ctx)}</div>
                        {f.links && f.links.length > 0 && <div className="hb-links">{f.links.map(renderLink)}</div>}
                      </div>
                    ) : (
                      <div className="hb-bubble hb-typing" aria-label="பதில் தயாராகிறது">
                        <i />
                        <i />
                        <i />
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}

            {related.length > 0 && (
              <div className="hb-related">
                <span>தொடர்புடைய கேள்விகள்</span>
                {related.map((f) => (
                  <button type="button" key={f.id} className="hb-chip-q" onClick={() => ask(f)}>
                    {f.q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hb-picker">
            <label className="hb-search">
              <FaSearch aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setListOpen(true);
                }}
                placeholder="கேள்வியைத் தேடுங்கள்… (எ.கா. சொற்கணை, join)"
                aria-label="கேள்வியைத் தேடுங்கள்"
              />
            </label>

            {!found && (
              <div className="hb-cats" role="tablist" aria-label="தலைப்புகள்">
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    role="tab"
                    aria-selected={activeCat === c.id}
                    className={`hb-cat ${activeCat === c.id ? "is-on" : ""}`}
                    onClick={() => {
                      setCat(c.id);
                      setListOpen(true);
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {!listOpen ? (
              <button type="button" className="hb-more" onClick={() => setListOpen(true)}>
                <FaChevronUp /> மேலும் கேள்விகள்
              </button>
            ) : (
              <div className="hb-list">
                {list.length === 0 ? (
                  <div className="hb-empty">
                    பொருத்தமான கேள்வி இல்லை.{" "}
                    <button type="button" className="hb-inline" onClick={() => ask(byId.get(NOT_FOUND_ID) || BUILT_IN_NOT_FOUND)}>
                      எம்மைத் தொடர்பு கொள்ள
                    </button>
                  </div>
                ) : (
                  list.map((f) => (
                    <button
                      type="button"
                      key={f.id}
                      className={`hb-q ${asked.has(f.id) ? "is-asked" : ""}`}
                      onClick={() => ask(f)}
                      disabled={busy}
                    >
                      {f.q}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
