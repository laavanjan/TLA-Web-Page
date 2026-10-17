// "TLA உதவி" - a pick-a-question assistant shown on every public page.
// No AI and no API keys: visitors choose a topic or search, tap a question,
// and get the prepared answer (the `faqs` table, edited at /admin/faq) as a
// chat reply, with links to the right page and related questions to try next.
// A த | EN switch shows everything in Tamil or English (remembered per visitor).
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaSearch, FaRedoAlt, FaArrowRight, FaExternalLinkAlt, FaChevronUp, FaChevronRight } from "react-icons/fa";
import {
  useFaqs,
  useFaqContext,
  fillTokens as fill,
  inLanguage,
  catLabel,
  FAQ_CATEGORIES,
  BUILT_IN_FAQS,
  POPULAR_IDS as POPULAR,
  NOT_FOUND_ID,
} from "../../shared/faq/faqs";
// Mukta Malar's Tamil, made for screens and bundled with the site (Windows'
// built-in Tamil font is thin and uneven at chat sizes). Only its Tamil part is
// loaded: English and numbers fall through to the system UI font, which sits
// better beside it. Browsers fetch only the weights a page actually uses.
import "@fontsource/mukta-malar/tamil-400.css";
import "@fontsource/mukta-malar/tamil-500.css";
import "@fontsource/mukta-malar/tamil-600.css";
import "@fontsource/mukta-malar/tamil-700.css";
import "./helpBot.css";

const CATEGORIES = [{ id: "popular" }, ...FAQ_CATEGORIES];
// What "எம்மைத் தொடர்பு கொள்ள" answers when a search finds nothing; the
// built-in copy if admins removed it.
const BUILT_IN_NOT_FOUND = BUILT_IN_FAQS.find((f) => f.id === NOT_FOUND_ID);
const TYPING_MS = 450;

// Everything the assistant itself says, in both languages.
const UI = {
  ta: {
    launcherAria: "TLA உதவி - கேள்விகளுக்குப் பதில்கள்",
    label: "உதவி",
    hint: "கேள்விகள் & பதில்கள்",
    teasers: ["கேள்விகள் & பதில்கள்", "தமிழருவி எப்போது?", "அணியில் இணைவது எப்படி?"],
    title: "TLA உதவி",
    sub: "கேள்வியைத் தெரிவு செய்யுங்கள் · உடனே பதில்",
    restart: "மீண்டும் தொடங்கு",
    close: "மூடு",
    greeting: "வணக்கம்! 🙏 தமிழ் இலக்கிய மன்றம் பற்றி அறிய விரும்புவதைக் கீழே தெரிவு செய்யுங்கள், அல்லது தேடுங்கள்.",
    typing: "பதில் தயாராகிறது",
    related: "தொடர்புடைய கேள்விகள்",
    search: "கேள்வியைத் தேடுங்கள்… (எ.கா. சொற்கணை, join)",
    searchAria: "கேள்வியைத் தேடுங்கள்",
    topics: "தலைப்புகள்",
    popular: "பிரபலமானவை",
    more: "மேலும் கேள்விகள்",
    none: "பொருத்தமான கேள்வி இல்லை.",
    contactUs: "எம்மைத் தொடர்பு கொள்ள",
    noEnglish: "",
    langAria: "மொழி",
  },
  en: {
    launcherAria: "TLA Help - answers to your questions",
    label: "Help",
    hint: "Questions & answers",
    teasers: ["Questions & answers", "When is Thamilaruvi?", "How do I join a team?"],
    title: "TLA Help",
    sub: "Pick a question · instant answer",
    restart: "Start again",
    close: "Close",
    greeting: "Hello! 🙏 Pick what you'd like to know about the Tamil Literary Association below, or search.",
    typing: "Writing an answer",
    related: "Related questions",
    search: "Search questions… (e.g. Sotkanai, join)",
    searchAria: "Search questions",
    topics: "Topics",
    popular: "Popular",
    more: "More questions",
    none: "No matching question.",
    contactUs: "Contact us",
    noEnglish: "This answer is only in Tamil for now.",
    langAria: "Language",
  },
};

const LANG_KEY = "tla_helpbot_lang";

// The button is just the gold த coin. Once per visit it unrolls to show its
// name and a few teaser questions: after PEEK_AFTER_MS on a page, or sooner
// if the visitor scrolls well down (looking for something). It rolls back
// after PEEK_FOR_MS; hovering or tabbing to it unrolls it any time.
const PEEK_KEY = "tla_helpbot_peeked";
const PEEK_AFTER_MS = 12000;
const PEEK_SCROLL = 0.55; // how far down the page counts as "looking"
const PEEK_FOR_MS = 9000;
const TEASER_MS = 3000;

const sessionFlag = (key, set) => {
  try {
    if (set) sessionStorage.setItem(key, "1");
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

// true while the button is unrolled on its own.
function usePeek(disabled) {
  const [peek, setPeek] = useState(false);

  useEffect(() => {
    if (disabled || sessionFlag(PEEK_KEY)) return undefined;
    let done = false;
    let hideTimer = 0;
    const show = () => {
      if (done) return;
      done = true;
      sessionFlag(PEEK_KEY, true);
      setPeek(true);
      hideTimer = setTimeout(() => setPeek(false), PEEK_FOR_MS);
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > PEEK_SCROLL) show();
    };
    const showTimer = setTimeout(show, PEEK_AFTER_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [disabled]);

  return [peek, setPeek];
}

// Cycles through the teaser lines while `on`.
function useTeaser(on, count) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!on) {
      setI(0);
      return undefined;
    }
    const t = setInterval(() => setI((n) => (n + 1) % count), TEASER_MS);
    return () => clearInterval(t);
  }, [on, count]);
  return i;
}
function readLang() {
  try {
    return localStorage.getItem(LANG_KEY) === "en" ? "en" : "ta";
  } catch {
    return "ta";
  }
}

const reducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFC");

// An answer as short paragraphs and proper bullet lists (lines starting with
// "•" or "-"), with "straight" quotes turned into “curly” ones.
const BULLET = /^\s*[•\-–]\s+/;
function formatAnswer(text) {
  const blocks = [];
  String(text)
    .replace(/"([^"\n]+)"/g, "“$1”")
    .split("\n")
    .forEach((raw) => {
      const line = raw.trim();
      if (!line) return;
      if (BULLET.test(line)) {
        const last = blocks[blocks.length - 1];
        const item = line.replace(BULLET, "");
        if (last && last.list) last.items.push(item);
        else blocks.push({ list: true, items: [item] });
      } else {
        blocks.push({ list: false, text: line });
      }
    });
  return blocks.map((b, i) =>
    b.list ? (
      <ul key={i} className="hb-ul">
        {b.items.map((item, k) => (
          <li key={k}>{item}</li>
        ))}
      </ul>
    ) : (
      <div key={i} className="hb-para">
        {b.text}
      </div>
    )
  );
}

// Every typed word must appear in the question (Tamil or English), its topic
// or its search words - whichever language is showing.
function searchFaqs(faqs, query) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return faqs.filter((f) => {
    const hay = norm(`${f.q} ${inLanguage(f, "en").q} ${catLabel(f.cat, "ta")} ${catLabel(f.cat, "en")} ${f.kw || ""}`);
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
  const [lang, setLangState] = useState(readLang);
  const t = UI[lang];
  // Never nudge someone who has already opened the chat.
  const [peek, setPeek] = usePeek(open);
  const teaser = useTeaser(peek, t.teasers.length);
  const setLang = (l) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  };
  const show = (f) => inLanguage(f, lang);
  const bodyRef = useRef(null);
  const searchRef = useRef(null);
  const keySeq = useRef(0);

  // The questions, contact details and member count are fetched the first time it opens.
  const faqs = useFaqs(open);
  const ctx = useFaqContext(open, lang);
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
    const label = fill(l.text, ctx);
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
        className={`hb-launcher ${open ? "is-hidden" : ""} ${peek ? "is-peek" : ""}`}
        onClick={() => {
          sessionFlag(PEEK_KEY, true);
          setPeek(false);
          setOpen(true);
        }}
        aria-label={t.launcherAria}
        aria-expanded={open}
      >
        <span className="hb-launcher-icon" aria-hidden="true">
          த<i className="hb-online" />
        </span>
        <span className="hb-launcher-text">
          <span className="hb-launcher-label">{t.label}</span>
          <span className="hb-launcher-hint" key={peek ? teaser : "hint"}>
            {peek ? t.teasers[teaser] : t.hint}
          </span>
        </span>
      </button>

      {open && (
        <div
          className={`hb-panel ${thread.length === 0 ? "is-fresh" : ""}`}
          role="dialog"
          aria-label={t.title}
          lang={lang === "en" ? "en" : "ta"}
        >
          <div className="hb-head">
            <span className="hb-avatar" aria-hidden="true">
              த<i className="hb-online" />
            </span>
            <div className="hb-head-text">
              <span className="hb-title">{t.title}</span>
              <span className="hb-sub">{t.sub}</span>
            </div>
            <div className="hb-lang" role="group" aria-label={t.langAria}>
              <button type="button" className={lang === "ta" ? "is-on" : ""} aria-pressed={lang === "ta"} onClick={() => setLang("ta")} lang="ta">
                த
              </button>
              <button type="button" className={lang === "en" ? "is-on" : ""} aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">
                EN
              </button>
            </div>
            {thread.length > 0 && (
              <button type="button" className="hb-icon" onClick={reset} aria-label={t.restart} title={t.restart}>
                <FaRedoAlt />
              </button>
            )}
            <button type="button" className="hb-icon" onClick={() => setOpen(false)} aria-label={t.close} title={t.close}>
              <FaTimes />
            </button>
          </div>

          <div className="hb-body" ref={bodyRef} aria-live="polite">
            <div className="hb-msg is-bot">
              <div className="hb-bubble">{t.greeting}</div>
            </div>

            {thread.map((m) => {
              const f = show(m.faq);
              return (
                <React.Fragment key={m.key}>
                  <div className="hb-msg is-user">
                    <div className="hb-bubble">{f.q}</div>
                  </div>
                  <div className="hb-msg is-bot">
                    {m.answered ? (
                      <div className="hb-bubble">
                        {lang === "en" && !f.english && <div className="hb-note">{t.noEnglish}</div>}
                        <div className="hb-answer">{formatAnswer(fill(f.a, ctx))}</div>
                        {f.links && f.links.length > 0 && <div className="hb-links">{f.links.map(renderLink)}</div>}
                      </div>
                    ) : (
                      <div className="hb-bubble hb-typing" aria-label={t.typing}>
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
                <span>{t.related}</span>
                {related.map((f) => (
                  <button type="button" key={f.id} className="hb-chip-q" onClick={() => ask(f)}>
                    {show(f).q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hb-picker">
            <div className="hb-search" onClick={() => searchRef.current && searchRef.current.focus()}>
              <FaSearch aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setListOpen(true);
                }}
                placeholder={t.search}
                aria-label={t.searchAria}
              />
            </div>

            {!found && (
              <div className="hb-cats" role="tablist" aria-label={t.topics}>
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
                    {c.id === "popular" ? t.popular : catLabel(c.id, lang)}
                  </button>
                ))}
              </div>
            )}

            {!listOpen ? (
              <button type="button" className="hb-more" onClick={() => setListOpen(true)}>
                <FaChevronUp /> {t.more}
              </button>
            ) : (
              <div className="hb-list">
                {list.length === 0 ? (
                  <div className="hb-empty">
                    {t.none}{" "}
                    <button type="button" className="hb-inline" onClick={() => ask(byId.get(NOT_FOUND_ID) || BUILT_IN_NOT_FOUND)}>
                      {t.contactUs}
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
                      <span>{show(f).q}</span>
                      <FaChevronRight aria-hidden="true" />
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
