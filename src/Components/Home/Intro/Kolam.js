// A kolam-style lotus mandala drawn as lines, so it can draw itself stroke by
// stroke as the page scrolls (it replaces the intro's old mandala picture).
// The geometry is worked out once, here, from a few rings of petals, a
// scalloped ring, spirals and pulli (dots). Each line carries `--d`, the point
// in the scroll (0..1, read from `--k` on a parent) where it starts drawing;
// see homeFx.css.
import React from "react";

const TAU = Math.PI * 2;
const f = (n) => Math.round(n * 10) / 10;

const at = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
};

// A point in a petal's own frame (x along the petal, y across it) turned to `deg`.
const turn = (x, y, deg) => {
  const a = (deg * Math.PI) / 180;
  return `${f(x * Math.cos(a) - y * Math.sin(a))},${f(x * Math.sin(a) + y * Math.cos(a))}`;
};

// An almond petal from radius r1 to r2, `w` wide, pointing at `deg`.
function petal(r1, r2, w, deg, belly = 0.32) {
  const L = r2 - r1;
  return (
    `M${turn(r1, 0, deg)}` +
    `C${turn(r1 + L * belly, w, deg)} ${turn(r2 - L * 0.28, w * 0.62, deg)} ${turn(r2, 0, deg)}` +
    `C${turn(r2 - L * 0.28, -w * 0.62, deg)} ${turn(r1 + L * belly, -w, deg)} ${turn(r1, 0, deg)}`
  );
}

const circle = (r) => `M${r},0A${r},${r} 0 1 1 ${-r},0A${r},${r} 0 1 1 ${r},0`;

// A ring of `n` little outward bumps.
function scallops(r, n, bump) {
  let d = `M${f(r)},0`;
  for (let k = 0; k < n; k += 1) {
    const [cx, cy] = at(r + bump, ((k + 0.5) * 360) / n);
    const [x, y] = at(r, ((k + 1) * 360) / n);
    d += `Q${f(cx)},${f(cy)} ${f(x)},${f(y)}`;
  }
  return d;
}

// A small spiral, `turns` times round, centred on (cx, cy).
function spiral(cx, cy, size, turns, start) {
  const steps = 48;
  let d = "";
  for (let k = 0; k <= steps; k += 1) {
    const t = k / steps;
    const a = start + t * turns * TAU;
    const r = size * t;
    d += `${k ? "L" : "M"}${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
  }
  return d;
}

function build() {
  const lines = []; // { d, at }
  const dots = []; // { x, y, r, at }
  const line = (d, when) => lines.push({ d, at: when });

  // the heart
  line(circle(24), 0);
  dots.push({ x: 0, y: 0, r: 7, at: 0.02 });
  for (let i = 0; i < 8; i += 1) line(petal(30, 64, 11, i * 45 + 22.5, 0.4), 0.03 + i * 0.006);
  line(circle(72), 0.08);
  line(circle(84), 0.1);

  // ring B: 12 petals with dots in the gaps
  for (let i = 0; i < 12; i += 1) {
    line(petal(88, 166, 27, i * 30), 0.13 + i * 0.008);
    const [x, y] = at(150, i * 30 + 15);
    dots.push({ x, y, r: 4.5, at: 0.22 + i * 0.005 });
  }
  line(scallops(176, 48, 9), 0.26);

  // ring C: 12 big petals between ring B's, each with a petal inside
  for (let i = 0; i < 12; i += 1) {
    const deg = i * 30 + 15;
    line(petal(172, 326, 64, deg, 0.26), 0.32 + i * 0.009);
    line(petal(198, 300, 38, deg, 0.3), 0.4 + i * 0.008);
    const [x, y] = at(282, deg);
    dots.push({ x, y, r: 6, at: 0.48 + i * 0.005 });
  }

  // ring D: 12 outer leaves with a vein, spirals in between
  for (let i = 0; i < 12; i += 1) {
    const deg = i * 30;
    line(petal(292, 470, 58, deg, 0.22), 0.52 + i * 0.01);
    line(`M${turn(318, 0, deg)}L${turn(440, 0, deg)}`, 0.62 + i * 0.006);
    for (const side of [-1, 1]) {
      const [x, y] = at(392, deg + 15 + side * 6);
      line(spiral(x, y, 15, 2.2, ((deg + 15) * Math.PI) / 180 + (side > 0 ? 0 : Math.PI)), 0.7 + i * 0.006);
    }
    const [tx, ty] = at(486, deg);
    dots.push({ x: tx, y: ty, r: 6.5, at: 0.8 + i * 0.008 });
    const [mx, my] = at(452, deg + 15);
    dots.push({ x: mx, y: my, r: 4, at: 0.84 + i * 0.008 });
  }

  return { lines, dots };
}

const KOLAM = build();

export default function Kolam({ className = "" }) {
  return (
    <svg className={`fx-kolam ${className}`} viewBox="-500 -500 1000 1000" aria-hidden="true" focusable="false">
      <g className="k-lines">
        {KOLAM.lines.map((l, i) => (
          <path key={i} d={l.d} pathLength="1" style={{ "--d": l.at }} />
        ))}
      </g>
      <g className="k-dots">
        {KOLAM.dots.map((p, i) => (
          <circle key={i} cx={f(p.x)} cy={f(p.y)} r={p.r} style={{ "--d": p.at }} />
        ))}
      </g>
    </svg>
  );
}
