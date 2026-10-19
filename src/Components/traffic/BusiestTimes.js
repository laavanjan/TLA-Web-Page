// When people visit: a weekday × hour grid (Sri Lanka time), darker for
// quiet hours and brighter gold for busy ones. Useful for picking when to
// post an announcement.
import React, { useMemo, useState } from "react";
import { FaClock } from "react-icons/fa";

import TrafficCard, { EmptyNote } from "./TrafficCard";
import { weekHourGrid } from "../../admin/trafficMath";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hourName = (h) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
const slot = (h) => `${hourName(h)}–${hourName((h + 1) % 24)}`;

function partOfDay(h) {
  if (h < 5) return "late at night";
  if (h < 12) return "in the morning";
  if (h < 17) return "in the afternoon";
  if (h < 21) return "in the evening";
  return "at night";
}

export default function BusiestTimes({ rows, index }) {
  const grid = useMemo(() => weekHourGrid(rows), [rows]);
  const [hover, setHover] = useState(null);

  const max = Math.max(0, ...grid.flat());
  const dayTotals = grid.map((r) => r.reduce((a, b) => a + b, 0));
  const hourTotals = Array.from({ length: 24 }, (_, h) => grid.reduce((s, r) => s + r[h], 0));
  const bestDay = dayTotals.indexOf(Math.max(...dayTotals));
  const bestHour = hourTotals.indexOf(Math.max(...hourTotals));

  return (
    <TrafficCard
      icon={FaClock}
      title="Busiest times"
      hint="Page views by day of the week and hour (Sri Lanka time). Brighter means busier."
      index={index}
    >
      {max === 0 ? (
        <EmptyNote>No visits in this period yet.</EmptyNote>
      ) : (
        <>
          <p className="tr-callout">
            Most visits come on <b>{DAYS[bestDay]}s</b>, and the busiest hour is <b>{slot(bestHour)}</b> ({partOfDay(bestHour)}). A
            good time to post news.
          </p>
          <div className="tr-heat" role="img" aria-label={`Busiest day ${DAYS[bestDay]}, busiest hour ${slot(bestHour)}.`}>
            <span />
            {Array.from({ length: 24 }, (_, h) => (
              <span key={`h${h}`} className="tr-heat-hour">
                {h % 3 === 0 ? hourName(h) : ""}
              </span>
            ))}
            {grid.map((row, d) => (
              <React.Fragment key={DAYS[d]}>
                <span className="tr-heat-day">{DAYS[d].slice(0, 3)}</span>
                {row.map((n, h) => (
                  <span
                    key={h}
                    className={`tr-heat-cell${n ? "" : " is-zero"}`}
                    style={{ "--a": n ? 0.15 + 0.85 * (n / max) : 0 }}
                    onMouseEnter={() => setHover({ d, h, n })}
                    onMouseLeave={() => setHover(null)}
                    title={`${DAYS[d]} ${slot(h)}: ${n} views`}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="tr-heat-foot">
            <span className="tr-heat-readout" aria-live="polite">
              {hover ? (
                <>
                  <b>{hover.n.toLocaleString("en-GB")}</b> views on {DAYS[hover.d]}s, {slot(hover.h)}
                </>
              ) : (
                "Point at a square to see its number."
              )}
            </span>
            <span className="tr-heat-scale" aria-hidden="true">
              Quiet <i /> Busy
            </span>
          </div>
        </>
      )}
    </TrafficCard>
  );
}
