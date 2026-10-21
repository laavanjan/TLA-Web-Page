// Who is on the site right now (active in the last 5 minutes) and which
// pages they have open. Refreshes itself every 15 seconds while this tab is
// visible.
import React, { useEffect, useState } from "react";
import { FaSatelliteDish } from "react-icons/fa";

import TrafficCard, { EmptyNote } from "./TrafficCard";
import { fetchLiveVisitors } from "../../admin/trafficData";
import { pageName, sourceMeta, flag, countryName, DEVICES } from "../../admin/trafficLabels";
import { ranked } from "../../admin/trafficMath";

const EVERY = 15 * 1000;

function useLive() {
  const [live, setLive] = useState(undefined);
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.visibilityState !== "visible") return;
      fetchLiveVisitors()
        .then((d) => {
          if (!alive) return;
          setLive(d);
          setUpdated(new Date());
        })
        .catch(() => alive && setLive(null));
    };
    load();
    const timer = setInterval(load, EVERY);
    document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  return { live, updated };
}

export default function LiveNow({ index }) {
  const { live, updated } = useLive();
  const count = live ? live.count : 0;

  return (
    <TrafficCard
      icon={FaSatelliteDish}
      title="On the site right now"
      hint="Visitors active in the last 5 minutes. Updates by itself."
      index={index}
      className="tr-live"
    >
      <div className="tr-live-count" aria-live="polite">
        <span className={`tr-pulse${count ? " is-on" : ""}`} aria-hidden="true" />
        <strong>{live === undefined ? "…" : count.toLocaleString("en-GB")}</strong>
        <span>{count === 1 ? "person browsing" : "people browsing"}</span>
      </div>

      {live === null && <EmptyNote>Couldn't load live visitors. It will try again in a moment.</EmptyNote>}
      {live && count === 0 && <EmptyNote>Nobody is on the site at the moment.</EmptyNote>}

      {live && count > 0 && (
        <>
          <ul className="tr-live-pages">
            {live.pages.map((p) => (
              <li key={p.path}>
                <span className="tr-live-page" title={p.path}>
                  {pageName(p.path, p.title)}
                </span>
                <b>{p.n}</b>
              </li>
            ))}
          </ul>
          <div className="tr-chips">
            {ranked(live.sources, 4).map(([k, n]) => {
              const meta = sourceMeta(k);
              const Icon = meta.icon;
              return (
                <span key={`s-${k}`} className="tr-chip">
                  <Icon aria-hidden="true" /> {meta.label} · {n}
                </span>
              );
            })}
            {ranked(live.devices, 3).map(([k, n]) => (
              <span key={`d-${k}`} className="tr-chip">
                {DEVICES[k] || k} · {n}
              </span>
            ))}
            {ranked(live.countries, 3).map(([k, n]) => (
              <span key={`c-${k}`} className="tr-chip" title={countryName(k)}>
                {flag(k)} {countryName(k)} · {n}
              </span>
            ))}
          </div>
        </>
      )}
      {updated && (
        <small className="tr-live-updated">
          Updated {updated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </small>
      )}
    </TrafficCard>
  );
}
