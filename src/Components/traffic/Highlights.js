// The page in a few sentences, for anyone who doesn't want to read charts:
// how many came, whether that's more or less than before, where from, and
// what they looked at most.
import React from "react";
import { FaLightbulb } from "react-icons/fa";

import { change, ranked, weekHourGrid } from "../../admin/trafficMath";
import { sourceMeta, pageName, isBookPage } from "../../admin/trafficLabels";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const fmt = (n) => n.toLocaleString("en-GB");

export function highlights(now, before, rows, rangeLabel) {
  if (!now.visitors) return [];
  const period = rangeLabel === "Today" ? "today" : `in the last ${rangeLabel.toLowerCase()}`;
  const out = [];

  const c = change(now.visitors, before.visitors);
  let trend = "";
  if (c !== null && Math.abs(c) >= 0.05) trend = `, ${c > 0 ? "up" : "down"} ${Math.round(Math.abs(c) * 100)}% on the period before`;
  else if (c !== null) trend = ", about the same as the period before";
  out.push(
    <>
      <b>{fmt(now.visitors)}</b> visitor{now.visitors === 1 ? "" : "s"} {period}
      {trend}.
    </>
  );

  const [topSource] = ranked(now.sources, 1);
  if (topSource) {
    const total = Object.values(now.sources).reduce((a, b) => a + b, 0);
    out.push(
      <>
        Most came from <b>{sourceMeta(topSource[0]).label}</b> ({Math.round((topSource[1] / total) * 100)}%).
      </>
    );
  }

  const pages = ranked(now.pages);
  const topPage = pages.find(([p]) => p !== "/") || pages[0];
  if (topPage) {
    out.push(
      <>
        {topPage[0] === "/" ? "The home page" : <b>{pageName(topPage[0], now.titles[topPage[0]])}</b>} was opened most
        {topPage[0] !== "/" && pages[0] && pages[0][0] === "/" ? " after the home page" : ""} ({fmt(topPage[1])} views).
      </>
    );
  }

  const book = pages.find(([p]) => isBookPage(p));
  if (book && book !== topPage) {
    out.push(
      <>
        The most read book was <b>{pageName(book[0], now.titles[book[0]]).replace(/^Book · /, "")}</b>.
      </>
    );
  }

  if (rows.length > 6) {
    const days = weekHourGrid(rows).map((r) => r.reduce((a, b) => a + b, 0));
    out.push(
      <>
        <b>{DAYS[days.indexOf(Math.max(...days))]}</b> is the busiest day of the week.
      </>
    );
  }
  return out;
}

export default function Highlights({ now, before, rows, rangeLabel }) {
  const lines = highlights(now, before, rows, rangeLabel);
  if (!lines.length) return null;
  return (
    <aside className="tr-highlights" aria-label="Summary">
      <span className="tr-highlights-icon" aria-hidden="true">
        <FaLightbulb />
      </span>
      <ul>
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </aside>
  );
}
