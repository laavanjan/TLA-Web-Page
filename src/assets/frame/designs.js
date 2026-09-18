// Registry of overlay designs the /frame editor offers in its picker.
//
// Two kinds live here, both exposed through a single `src` (an <img>/canvas
// source — either an imported image URL or an inline SVG data URL):
//   1. Finished raster artwork (gold / silver / copper metallic calligraphy) —
//      kept as PNGs because their gradients and fine detail would be destroyed
//      by vector tracing. Downscaled to 1600px wide for the web.
//   2. Lightweight SVG text designs, drawn with the site "Heading" font that is
//      base64-embedded so the Tamil lettering renders even when the SVG is
//      painted onto the editor canvas (a canvas can't reach web fonts by name).
//
// To add another: append an entry with its natural width/height. The picker and
// the canvas both read straight from this array.
import { HEADING_TTF_BASE64 } from "./headingFont";
import goldSrc from "./designs/gold.png";
import silverSrc from "./designs/silver.png";
import copperSrc from "./designs/copper.png";

const FONT_FACE = `@font-face{font-family:'Heading';font-style:normal;font-weight:400;src:url(data:font/ttf;base64,${HEADING_TTF_BASE64}) format('truetype');}`;
const FONT_STACK = "'Heading','Noto Sans Tamil','Latha',sans-serif";

function toDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

// --- SVG text designs --------------------------------------------------------

// Classic — white, two lines with a flourish underline.
const classic = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 240" width="520" height="240">
  <defs><style>${FONT_FACE}</style></defs>
  <g fill="#ffffff" font-family="${FONT_STACK}" text-anchor="middle">
    <text x="260" y="98" font-size="62">தமிழ் இலக்கிய</text>
    <text x="260" y="168" font-size="62">மன்றம்</text>
  </g>
  <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.9">
    <line x1="150" y1="208" x2="240" y2="208" />
    <line x1="280" y1="208" x2="370" y2="208" />
    <circle cx="260" cy="208" r="7" fill="#ffffff" stroke="none" />
  </g>
</svg>`;

// Emblem — gold lettering framed by thin rules above and below.
const emblem = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 220" width="520" height="220">
  <defs><style>${FONT_FACE}</style></defs>
  <g stroke="#ffd76e" stroke-width="3" opacity="0.95" stroke-linecap="round">
    <line x1="130" y1="34" x2="390" y2="34" />
    <line x1="130" y1="188" x2="390" y2="188" />
  </g>
  <g fill="#ffd76e" font-family="${FONT_STACK}" text-anchor="middle">
    <text x="260" y="100" font-size="56">தமிழ் இலக்கிய</text>
    <text x="260" y="160" font-size="56">மன்றம்</text>
  </g>
</svg>`;

// Stacked — big white "தமிழ்" with the rest smaller beneath; more square.
const stacked = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="460" height="260">
  <defs><style>${FONT_FACE}</style></defs>
  <g font-family="${FONT_STACK}" text-anchor="middle" fill="#ffffff">
    <text x="230" y="120" font-size="108">தமிழ்</text>
    <text x="230" y="190" font-size="44" opacity="0.95">இலக்கிய மன்றம்</text>
  </g>
  <circle cx="230" cy="220" r="6" fill="#ffd76e" />
</svg>`;

export const DESIGNS = [
  // Finished metallic artwork (1600 x 765)
  { id: "gold", label: "Gold", w: 1600, h: 765, src: goldSrc },
  { id: "silver", label: "Silver", w: 1600, h: 765, src: silverSrc },
  { id: "copper", label: "Copper", w: 1600, h: 765, src: copperSrc },
  // SVG text designs
  { id: "classic", label: "Classic", w: 520, h: 240, src: toDataUrl(classic) },
  { id: "emblem", label: "Emblem", w: 520, h: 220, src: toDataUrl(emblem) },
  { id: "stacked", label: "Stacked", w: 460, h: 260, src: toDataUrl(stacked) },
].map((d) => ({ ...d, ratio: d.w / d.h }));
