// Placeholder "Tamil writing in design" overlay used by the /frame editor.
// Replace this with the real artwork later: either swap the SVG markup below,
// or drop a .svg file in and load it instead. Keeping it as a function means the
// design stays recolorable (light/dark) via a single `color` argument — if the
// real SVG is single-color, inject the same `fill={color}` and it keeps working.
export function tamilDesignSvg(color = "#ffffff") {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200" width="520" height="200">
  <g fill="${color}" font-family="'Noto Sans Tamil','Latha',sans-serif" text-anchor="middle">
    <text x="260" y="96" font-size="86" font-weight="800" letter-spacing="2">தமிழ்</text>
    <text x="260" y="150" font-size="34" font-weight="600" letter-spacing="6" opacity="0.92">மன்றம்</text>
  </g>
  <g stroke="${color}" stroke-width="4" stroke-linecap="round" opacity="0.9">
    <line x1="150" y1="172" x2="240" y2="172" />
    <line x1="280" y1="172" x2="370" y2="172" />
    <circle cx="260" cy="172" r="7" fill="${color}" stroke="none" />
  </g>
</svg>`.trim();
}

// A crisp data-URL for the SVG above, ready to hand to an <img> / canvas image.
export function tamilDesignDataUrl(color) {
  const svg = tamilDesignSvg(color);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
