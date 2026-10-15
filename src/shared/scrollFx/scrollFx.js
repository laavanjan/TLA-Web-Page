// Scroll-driven effects (home page). One passive scroll listener and at most
// one requestAnimationFrame per frame write each watched element's progress
// (0..1) into a CSS variable on that element, so the effects themselves are
// plain CSS and React never re-renders while scrolling.
//
//   const ref = useRef(null);
//   useScrollVar(ref, exitProgress, { name: "--hero" });
//   .hero-image { transform: translateY(calc(var(--hero) * 30%)); }
//
// With "reduce motion" switched on in the system, every variable is pinned to
// its resting value (`reduced`) instead of following the scroll.
import { useEffect, useRef, useState } from "react";

const watchers = new Set();
let frame = 0;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

function run() {
  frame = 0;
  const vh = window.innerHeight || 1;
  watchers.forEach((w) => w(vh));
}

function schedule() {
  if (!frame) frame = window.requestAnimationFrame(run);
}

function watch(fn) {
  if (!watchers.size) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  watchers.add(fn);
  schedule();
  return () => {
    watchers.delete(fn);
    if (!watchers.size) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

// ---- Ways to measure progress: (rect, viewportHeight) -> 0..1 -----------------------------

// 0 while the element's top is at (or below) the top of the screen, 1 once
// its bottom has scrolled off the top - for a hero being scrolled away.
export const exitProgress = (rect) => clamp01(-rect.top / Math.max(1, rect.height));

// 0 when the element's `anchor` ("top" | "center" | "bottom") sits at `from`
// (a fraction of the screen height, 1 = bottom edge), 1 when it reaches `to`.
export const rangeProgress = (anchor, from, to) => (rect, vh) => {
  const y = anchor === "center" ? rect.top + rect.height / 2 : anchor === "bottom" ? rect.bottom : rect.top;
  return clamp01((from * vh - y) / ((from - to) * vh));
};

// How far down the whole page the reader is.
export const pageProgress = () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  return max > 0 ? clamp01(window.scrollY / max) : 0;
};

// ---- Hooks ---------------------------------------------------------------------------------

// Keeps `name` on ref.current at the element's progress. `measure` is one of
// the functions above (or your own); `reduced` is the value used when the
// visitor prefers less motion.
export function useScrollVar(ref, measure, { name = "--p", reduced = 1 } = {}) {
  const measureRef = useRef(measure);
  measureRef.current = measure;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion()) {
      el.style.setProperty(name, String(reduced));
      return undefined;
    }
    let last = -1;
    return watch((vh) => {
      const p = measureRef.current(el.getBoundingClientRect(), vh);
      if (Math.abs(p - last) < 0.0005) return;
      last = p;
      el.style.setProperty(name, p.toFixed(4));
    });
  }, [ref, name, reduced]);
}

// true once the element has come into view (and stays true).
export function useInView(ref, { rootMargin = "0px 0px -12% 0px", threshold = 0.15 } = {}) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, rootMargin, threshold]);

  return seen;
}

// true while the page is scrolled more than `px` down (re-renders only when
// that flips).
export function useScrolledPast(px) {
  const [past, setPast] = useState(() => typeof window !== "undefined" && window.scrollY > px);

  useEffect(() => watch(() => setPast(window.scrollY > px)), [px]);

  return past;
}
