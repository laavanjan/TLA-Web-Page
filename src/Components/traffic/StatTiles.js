// The four headline numbers at the top of the Traffic page, each compared
// with the period before and with a small line of its daily trend.
import React from "react";
import { FaUserFriends, FaEye, FaUserPlus, FaDoorOpen, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { change } from "../../admin/trafficMath";

const fmt = (n) => Math.round(n).toLocaleString("en-GB");
const pct = (f) => `${Math.round(f * 100)}%`;

function Sparkline({ values, color }) {
  if (values.length < 2 || !values.some((v) => v > 0)) return null;
  const w = 120;
  const h = 32;
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - 2 - (v / max) * (h - 4)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg className="tr-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={color} opacity="0.14" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// "up 18%" in green, "down 5%" in red; for bounce rate, going down is good.
function Delta({ now, before, lowerIsBetter, label }) {
  const c = change(now, before);
  if (c === null) return <span className="tr-delta is-flat">New · nothing to compare with</span>;
  if (Math.abs(c) < 0.005) return <span className="tr-delta is-flat">Same as {label}</span>;
  const up = c > 0;
  const good = lowerIsBetter ? !up : up;
  const Icon = up ? FaArrowUp : FaArrowDown;
  return (
    <span className={`tr-delta ${good ? "is-good" : "is-bad"}`}>
      <Icon aria-hidden="true" />
      {up ? "Up" : "Down"} {Math.abs(c) >= 10 ? `${fmt(c + 1)}×` : pct(Math.abs(c))} vs {label}
    </span>
  );
}

function Tile({ icon: Icon, label, value, hint, delta, spark, color, index }) {
  return (
    <div className="tr-tile" style={{ "--i": index, "--accent": color }}>
      <div className="tr-tile-top">
        <span className="tr-tile-icon" aria-hidden="true">
          <Icon />
        </span>
        <span className="tr-tile-label">{label}</span>
      </div>
      <strong className="tr-tile-value">{value}</strong>
      {delta}
      <small className="tr-tile-hint">{hint}</small>
      {spark}
    </div>
  );
}

export default function StatTiles({ now, before, series, rangeLabel }) {
  const vs = rangeLabel === "Today" ? "yesterday" : `previous ${rangeLabel.toLowerCase()}`;
  const newShare = now.visitors ? now.newVisitors / now.visitors : 0;
  return (
    <div className="tr-tiles">
      <Tile
        index={0}
        icon={FaUserFriends}
        color="#e6b422"
        label="Visitors"
        value={fmt(now.visitors)}
        hint="People who opened the site, each counted once a day"
        delta={<Delta now={now.visitors} before={before.visitors} label={vs} />}
        spark={<Sparkline values={series.map((p) => p.visitors)} color="#e6b422" />}
      />
      <Tile
        index={1}
        icon={FaEye}
        color="#3987e5"
        label="Page views"
        value={fmt(now.views)}
        hint={now.sessions ? `About ${now.pagesPerVisit.toFixed(1)} pages per visit` : "Every page opened"}
        delta={<Delta now={now.views} before={before.views} label={vs} />}
        spark={<Sparkline values={series.map((p) => p.views)} color="#3987e5" />}
      />
      <Tile
        index={2}
        icon={FaUserPlus}
        color="#199e70"
        label="New visitors"
        value={now.visitors ? pct(newShare) : "–"}
        hint={now.visitors ? `${fmt(now.newVisitors)} new · ${fmt(now.returning)} came back` : "First time on the site"}
        delta={<Delta now={now.newVisitors} before={before.newVisitors} label={vs} />}
      />
      <Tile
        index={3}
        icon={FaDoorOpen}
        color="#d95926"
        label="Left after one page"
        value={now.sessions ? pct(now.bounceRate) : "–"}
        hint="Visits that ended on the first page. Lower is better"
        delta={<Delta now={now.bounceRate} before={before.bounceRate} lowerIsBetter label={vs} />}
      />
    </div>
  );
}
