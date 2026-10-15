// A page-turning reader for an uploaded book. Each page is a picture that
// Cloudinary draws from the PDF (see pdfPageImage in src/book/books.js), so it
// works the same on phones and computers and needs no PDF library.
//
// Wide screens show two-page spreads with the cover on its own, and pages turn
// over the spine; narrow screens show one page that slides. Turn with the
// arrows, the ← → keys, a swipe, or a click on either side of the book; jump
// with the slider or the page grid. The current page is kept in the address
// (#page=12) so a link can open the book at that page.
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaThLarge, FaExpand, FaCompress, FaTimes } from "react-icons/fa";
import "./flipBook.css";

const SPREAD_MIN = 820; // reader width (px) from which two pages show side by side
const WIDTHS = [700, 1100, 1600]; // picture sizes asked of Cloudinary
const DEFAULT_RATIO = 0.72; // page width / height until the first page loads

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pageFromHash = (count) => {
  const m = /page=(\d+)/.exec(window.location.hash || "");
  const n = m ? Number(m[1]) : 1;
  return Math.min(Math.max(1, n), count);
};

export default function FlipBook({ count, pageSrc, title }) {
  const shellRef = useRef(null);
  const stageRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [viewH, setViewH] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 800));
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const [page, setPage] = useState(() => pageFromHash(count)); // first visible page
  const [turn, setTurn] = useState(null); // spreads: { dir: 1 | -1 }
  const [slide, setSlide] = useState(0); // single page: direction of the last move
  const [grid, setGrid] = useState(false);
  const [full, setFull] = useState(false);
  const [fakeFull, setFakeFull] = useState(false); // browsers without the Fullscreen API (iPhone)
  const swipe = useRef(null);

  // ---- Size --------------------------------------------------------------------------------
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(el);
    const onResize = () => {
      setViewH(window.innerHeight);
      measure();
    };
    window.addEventListener("resize", onResize);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const spread = width >= SPREAD_MIN;
  const inFull = full || fakeFull;
  const maxH = inFull ? viewH - 96 : Math.min(viewH * 0.82, 1000);
  const pageW = Math.max(120, Math.floor(Math.min(spread ? width / 2 : width, maxH * ratio)));
  const pageH = Math.floor(pageW / ratio);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const picW = WIDTHS.find((w) => w >= pageW * dpr) || WIDTHS[WIDTHS.length - 1];
  const src = useCallback((n) => pageSrc(n, picW), [pageSrc, picW]);

  // ---- Where we are ------------------------------------------------------------------------
  // Spreads: 0 = [cover], s = [2s, 2s+1]; the last one may be a single left page.
  const lastSpread = Math.floor(count / 2);
  const s = Math.floor(page / 2);
  const has = (n) => n >= 1 && n <= count;
  const firstShown = spread ? Math.max(1, 2 * s) : page;
  const lastShown = spread ? Math.min(count, 2 * s + 1) : page;
  const atStart = spread ? s === 0 : page === 1;
  const atEnd = spread ? s >= lastSpread : page >= count;

  useEffect(() => {
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", page > 1 ? `${pathname}${search}#page=${page}` : `${pathname}${search}`);
  }, [page]);

  // Fetch the next few pages ahead of time so turning never shows a blank page.
  useEffect(() => {
    const ahead = spread ? [2 * s + 2, 2 * s + 3, 2 * s + 4, 2 * s + 5, 2 * s - 1, 2 * s - 2] : [page + 1, page + 2, page - 1];
    ahead.filter(has).forEach((n) => {
      const img = new Image();
      img.src = src(n);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, spread, src]);

  // ---- Moving ------------------------------------------------------------------------------
  const go = useCallback(
    (dir) => {
      if (turn) return;
      if (spread) {
        if ((dir > 0 && s >= lastSpread) || (dir < 0 && s === 0)) return;
        const target = dir > 0 ? 2 * (s + 1) : Math.max(1, 2 * (s - 1));
        if (prefersReducedMotion()) setPage(target);
        else setTurn({ dir, target });
      } else {
        const target = page + dir;
        if (!has(target)) return;
        setSlide(dir);
        setPage(target);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turn, spread, s, lastSpread, page, count]
  );

  const jump = (n) => {
    const target = Math.min(Math.max(1, n), count);
    setTurn(null);
    setSlide(0);
    setPage(target);
  };

  const endTurn = (e) => {
    // The shading on each face animates too; only the leaf's own turn counts.
    if (e && e.target !== e.currentTarget) return;
    if (!turn) return;
    setPage(turn.target);
    setTurn(null);
  };

  // A turn whose animation never reports back (tab hidden mid-turn) still lands.
  useEffect(() => {
    if (!turn) return undefined;
    const t = setTimeout(() => endTurn(), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag) && e.target.type !== "range") return;
      // Only the side arrows: Home / End / Page keys keep scrolling the page.
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") {
        if (grid) setGrid(false);
        else if (fakeFull) setFakeFull(false);
      } else return;
      if (e.key !== "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, grid, fakeFull]);

  // Click either side of the book to turn; drag / swipe sideways to turn.
  const onPointerDown = (e) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || e.target.closest("button")) return; // the arrow buttons turn on their own
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
      return;
    }
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      const box = e.currentTarget.getBoundingClientRect();
      go(e.clientX - box.left > box.width / 2 ? 1 : -1);
    }
  };

  // ---- Full screen -------------------------------------------------------------------------
  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!fakeFull) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fakeFull]);

  const toggleFull = () => {
    const el = shellRef.current;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (fakeFull) setFakeFull(false);
    else if (el && el.requestFullscreen) el.requestFullscreen().catch(() => setFakeFull(true));
    else setFakeFull(true);
  };

  // ---- Drawing -----------------------------------------------------------------------------
  const onFirstLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (w && h && ratio === DEFAULT_RATIO) setRatio(Math.min(1.2, Math.max(0.5, w / h)));
  };

  // A plain function, not a component, so pages aren't remounted (and their
  // pictures redrawn) on every render.
  const renderPage = (n, side) => (
    <div key={side} className={`fb-page is-${side} ${n ? "" : "is-empty"}`}>
      {n ? (
        <img
          src={src(n)}
          alt={`${title} - பக்கம் ${n}`}
          draggable={false}
          decoding="async"
          onLoad={n === 1 || ratio === DEFAULT_RATIO ? onFirstLoad : undefined}
        />
      ) : null}
    </div>
  );

  let body;
  if (spread) {
    const pg = (n) => (has(n) ? n : null);
    let left = pg(2 * s);
    let right = pg(2 * s + 1);
    let leaf = null;
    if (turn && turn.dir > 0) {
      right = pg(2 * s + 3);
      leaf = { side: "right", front: pg(2 * s + 1), back: pg(2 * s + 2) };
    } else if (turn && turn.dir < 0) {
      left = pg(2 * s - 2);
      leaf = { side: "left", front: pg(2 * s), back: pg(2 * s - 1) };
    }
    // Where the book is heading: a lone cover sits centred, so does a lone last page.
    const toS = turn ? Math.floor(turn.target / 2) : s;
    const shift = toS === 0 ? -25 : !has(2 * toS + 1) ? 25 : 0;
    const read = Math.min(1, lastShown / count);
    body = (
      <div
        className={`fb-book is-spread ${turn ? "is-turning" : ""}`}
        style={{
          width: pageW * 2,
          height: pageH,
          transform: `translateX(${shift}%)`,
          "--stack-l": `${Math.round(2 + 8 * read)}px`,
          "--stack-r": `${Math.round(2 + 8 * (1 - read))}px`,
        }}
      >
        {left && <span className="fb-stack is-left" />}
        {right && <span className="fb-stack is-right" />}
        {renderPage(left, "left")}
        {renderPage(right, "right")}
        {left && right && <span className="fb-spine" />}
        {leaf && (
          <div className={`fb-leaf is-${leaf.side}`} onAnimationEnd={endTurn}>
            <div className={`fb-face is-front is-${leaf.side}`}>
              {leaf.front && <img src={src(leaf.front)} alt="" draggable={false} />}
            </div>
            <div className={`fb-face is-back is-${leaf.side === "right" ? "left" : "right"}`}>
              {leaf.back && <img src={src(leaf.back)} alt="" draggable={false} />}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    body = (
      <div className="fb-book is-single" style={{ width: pageW, height: pageH }}>
        <div key={page} className={`fb-slide ${slide > 0 ? "from-right" : slide < 0 ? "from-left" : ""}`}>
          {renderPage(page, "single")}
        </div>
      </div>
    );
  }

  const label = firstShown === lastShown ? `${firstShown}` : `${firstShown}–${lastShown}`;

  return (
    <div ref={shellRef} className={`fb ${inFull ? "is-full" : ""} ${fakeFull ? "is-fake-full" : ""}`}>
      <div
        ref={stageRef}
        className="fb-stage"
        style={{ minHeight: pageH + 24 }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
        role="region"
        aria-roledescription="book"
        aria-label={`${title} - பக்கம் ${label} / ${count}`}
      >
        {width > 0 && body}
        <button type="button" className="fb-edge is-prev" onClick={() => go(-1)} disabled={atStart || !!turn} aria-label="முந்தைய பக்கம்">
          <FaChevronLeft />
        </button>
        <button type="button" className="fb-edge is-next" onClick={() => go(1)} disabled={atEnd || !!turn} aria-label="அடுத்த பக்கம்">
          <FaChevronRight />
        </button>
      </div>

      <div className="fb-bar">
        <span className="fb-progress" style={{ width: `${(lastShown / count) * 100}%` }} />
        <button type="button" className="fb-btn" onClick={() => go(-1)} disabled={atStart} aria-label="முந்தைய பக்கம்">
          <FaChevronLeft />
        </button>
        <input
          type="range"
          className="fb-range"
          min={1}
          max={count}
          value={firstShown}
          onChange={(e) => jump(Number(e.target.value))}
          aria-label="பக்கத்துக்குச் செல்"
        />
        <span className="fb-count">
          <b>{label}</b> / {count}
        </span>
        <button type="button" className="fb-btn" onClick={() => go(1)} disabled={atEnd} aria-label="அடுத்த பக்கம்">
          <FaChevronRight />
        </button>
        <span className="fb-sep" />
        <button type="button" className={`fb-btn ${grid ? "is-on" : ""}`} onClick={() => setGrid((g) => !g)} aria-label="எல்லாப் பக்கங்களும்" title="எல்லாப் பக்கங்களும்">
          <FaThLarge />
        </button>
        <button type="button" className="fb-btn" onClick={toggleFull} aria-label={inFull ? "சிறிதாக்கு" : "முழுத் திரை"} title={inFull ? "சிறிதாக்கு" : "முழுத் திரை"}>
          {inFull ? <FaCompress /> : <FaExpand />}
        </button>
      </div>

      {grid && (
        <div className="fb-grid" role="dialog" aria-label="எல்லாப் பக்கங்களும்">
          <div className="fb-grid-head">
            <span>எல்லாப் பக்கங்களும் · {count}</span>
            <button type="button" className="fb-btn" onClick={() => setGrid(false)} aria-label="மூடு">
              <FaTimes />
            </button>
          </div>
          <div className="fb-grid-list">
            {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                key={n}
                className={`fb-thumb ${n >= firstShown && n <= lastShown ? "is-current" : ""}`}
                onClick={() => {
                  jump(n);
                  setGrid(false);
                }}
              >
                <img src={pageSrc(n, 200)} alt="" loading="lazy" />
                <span>{n}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
