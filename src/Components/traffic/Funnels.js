// From visiting to sending a form: how many visits reached each step, in
// order, and where most people stopped. Counted per visit (session).
import React, { useEffect, useState } from "react";
import { FaFilter, FaArrowDown } from "react-icons/fa";

import TrafficCard, { EmptyNote } from "./TrafficCard";
import { fetchFunnel } from "../../admin/trafficData";
import { addDays, daysBetween } from "../../admin/trafficMath";
import { FUNNELS } from "../../admin/trafficLabels";

const RAW_DAYS = 90; // raw events are kept this long (analytics.sql)

const pct = (n, of) => (of ? Math.round((n / of) * 100) : 0);

function Funnel({ funnel, counts }) {
  const start = counts[0] || 0;
  // The step that loses the most people, to point at what to improve.
  let worst = -1;
  let worstLoss = 0;
  counts.forEach((n, i) => {
    if (!i || !counts[i - 1]) return;
    const loss = 1 - n / counts[i - 1];
    if (loss > worstLoss) {
      worstLoss = loss;
      worst = i;
    }
  });

  return (
    <div className="tr-funnel">
      <h3>{funnel.title}</h3>
      <ol>
        {funnel.steps.map((s, i) => {
          const n = counts[i] || 0;
          const prev = i ? counts[i - 1] || 0 : 0;
          return (
            <li key={s.label}>
              {i > 0 && (
                <span className={`tr-funnel-drop${i === worst ? " is-worst" : ""}`}>
                  <FaArrowDown aria-hidden="true" />
                  {prev ? `${pct(n, prev)}% continued` : "–"}
                  {i === worst && prev > 0 && " · most people stop here"}
                </span>
              )}
              <div className="tr-funnel-step">
                <span className="tr-funnel-bar" style={{ "--w": `${start ? Math.max(2, (n / start) * 100) : 0}%` }} aria-hidden="true" />
                <span className="tr-funnel-label">
                  <b>{i + 1}</b> {s.label}
                </span>
                <span className="tr-funnel-n">
                  {n.toLocaleString("en-GB")}
                  {i > 0 && <small>{pct(n, start)}%</small>}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function Funnels({ dates, index }) {
  const [counts, setCounts] = useState(undefined);
  const clipped = daysBetween(dates.from, dates.to) + 1 > RAW_DAYS;
  const from = clipped ? addDays(dates.to, -(RAW_DAYS - 1)) : dates.from;

  useEffect(() => {
    let alive = true;
    Promise.all(FUNNELS.map((f) => fetchFunnel(from, dates.to, f.steps.map((s) => s.step))))
      .then((all) => alive && setCounts(all))
      .catch(() => alive && setCounts(null));
    return () => {
      alive = false;
    };
  }, [from, dates]); // dates is a new object on Refresh, so that reloads too

  return (
    <TrafficCard
      icon={FaFilter}
      title="From visit to form"
      hint={`How many visits went on to each next step.${clipped ? " Covers the last 90 days." : ""}`}
      index={index}
      className="tr-funnels-card"
    >
      {counts === undefined && <div className="tr-loading tr-loading-sm" />}
      {counts === null && <EmptyNote>Couldn't load the funnels.</EmptyNote>}
      {counts && !counts.some((c) => c[0]) && <EmptyNote>No visits in this period yet.</EmptyNote>}
      {counts && counts.some((c) => c[0]) && (
        <div className="tr-funnels">
          {FUNNELS.map((f, i) => (
            <Funnel key={f.id} funnel={f} counts={counts[i] || []} />
          ))}
        </div>
      )}
    </TrafficCard>
  );
}
