// A lotus that blooms as you read down the home page: a closed bud at the top,
// in full bloom at the bottom, with a gold ring showing how far you've come.
// It appears once the hero is behind you; a tap floats you back to the top.
// Driven by `--page` (0..1) - see homeFx.css.
import React, { useRef } from "react";
import { useScrollVar, useScrolledPast, pageProgress } from "../../shared/scrollFx/scrollFx";

// Outer petals first so the inner ones sit on top.
const PETALS = [-66, 66, -44, 44, -22, 22, 0];
const PETAL = "M32,45 C25.5,37 26.5,24 32,15 C37.5,24 38.5,37 32,45 Z";

export default function LotusProgress() {
  const ref = useRef(null);
  useScrollVar(ref, pageProgress, { name: "--page", reduced: 1 });
  const shown = useScrolledPast(360);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      ref={ref}
      type="button"
      className={`fx-lotus-progress ${shown ? "is-shown" : ""}`}
      onClick={toTop}
      aria-label="மேலே செல்ல"
      title="மேலே செல்ல"
      tabIndex={shown ? 0 : -1}
    >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="fxPetal" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#f7c6d3" />
            <stop offset="1" stopColor="#e86f93" />
          </linearGradient>
          <linearGradient id="fxPetalOuter" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fbe1e8" />
            <stop offset="1" stopColor="#f29ab4" />
          </linearGradient>
        </defs>
        <circle className="lp-track" cx="32" cy="32" r="29" />
        {/* a path, not a circle, so it starts at the top and pathLength works everywhere */}
        <path className="lp-ring" d="M32,3 A29,29 0 1 1 32,61 A29,29 0 1 1 32,3" pathLength="1" />
        <path className="lp-water" d="M17,49 Q32,54 47,49" />
        {PETALS.map((a) => (
          <path
            key={a}
            className={`lp-petal ${Math.abs(a) > 30 ? "is-outer" : ""}`}
            d={PETAL}
            style={{ "--a": `${a}deg` }}
          />
        ))}
        <circle className="lp-heart" cx="32" cy="38" r="2.6" />
      </svg>
    </button>
  );
}
