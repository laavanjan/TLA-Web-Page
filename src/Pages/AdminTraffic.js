// /admin/traffic — who visits the website: daily visitors, who is on it right
// now, where they come from, the most visited pages, the busiest hours and
// how many go on to send a form. Counted by src/analytics/tracker.js and
// stored by supabase/migrations/analytics.sql. Main admins only.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FaSyncAlt, FaDatabase } from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import { fetchTrafficDays, TrafficNotSetUp } from "../admin/trafficData";
import { RANGES, rangeDates, totals, dailySeries } from "../admin/trafficMath";
import StatTiles from "../Components/traffic/StatTiles";
import VisitorsChart from "../Components/traffic/VisitorsChart";
import LiveNow from "../Components/traffic/LiveNow";
import Sources from "../Components/traffic/Sources";
import TopPages from "../Components/traffic/TopPages";
import BusiestTimes from "../Components/traffic/BusiestTimes";
import "./Frame.css";
import "./Admin.css";
import "./AdminDashboard.css";
import "./AdminTraffic.css";

const RANGE_KEY = "tla_traffic_range";

const savedRange = () => {
  try {
    const id = localStorage.getItem(RANGE_KEY);
    return RANGES.some((r) => r.id === id) ? id : "30d";
  } catch (e) {
    return "30d";
  }
};

// The rows for the chosen range and the one before it, in one request. While
// a new range loads, the old numbers stay on screen (dimmed) instead of
// flashing empty.
function useTraffic(rangeId, reloadKey) {
  const [state, setState] = useState({ status: "loading", rows: [], prevRows: [] });
  const dates = useMemo(() => rangeDates(rangeId), [rangeId, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, busy: true }));
    fetchTrafficDays(dates.prevFrom, dates.to)
      .then((all) => {
        if (!alive) return;
        setState({
          status: "ready",
          rows: all.filter((r) => r.day >= dates.from),
          prevRows: all.filter((r) => r.day < dates.from),
          busy: false,
        });
      })
      .catch((err) => {
        if (!alive) return;
        setState({ status: err instanceof TrafficNotSetUp ? "notsetup" : "error", message: err.message, rows: [], prevRows: [] });
      });
    return () => {
      alive = false;
    };
  }, [dates]);

  return { ...state, dates };
}

function NotSetUp() {
  return (
    <div className="tr-setup">
      <FaDatabase aria-hidden="true" />
      <h2>Traffic counting isn't switched on yet</h2>
      <p>
        Open Supabase → <b>SQL Editor</b>, paste in <code>supabase/migrations/analytics.sql</code> and press <b>Run</b>.
        Counting starts straight away, and the numbers appear here as people visit.
      </p>
    </div>
  );
}

export default function AdminTraffic() {
  const [rangeId, setRangeId] = useState(savedRange);
  const [reloadKey, setReloadKey] = useState(0);
  const traffic = useTraffic(rangeId, reloadKey);
  const now = useMemo(() => totals(traffic.rows), [traffic.rows]);
  const before = useMemo(() => totals(traffic.prevRows), [traffic.prevRows]);
  const series = useMemo(
    () => dailySeries(traffic.rows, traffic.dates.from, traffic.dates.to),
    [traffic.rows, traffic.dates]
  );
  const rangeLabel = (RANGES.find((r) => r.id === rangeId) || RANGES[2]).label;

  const pickRange = useCallback((id) => {
    setRangeId(id);
    try {
      localStorage.setItem(RANGE_KEY, id);
    } catch (e) {
      // only a convenience
    }
  }, []);

  const ready = traffic.status === "ready";

  return (
    <div className="frame-page admin-page ad-page tr-page">
      <Helmet>
        <title>Traffic · Admin</title>
      </Helmet>
      <div className="ad-aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Traffic</span>
      </header>

      <div className="tr-wrap">
        <div className="tr-topnav">
          <Link to="/admin" className="tj-back">
            ← Dashboard
          </Link>
          <div className="tr-top-actions">
            <button
              type="button"
              className="tj-btn tj-btn-ghost"
              onClick={() => setReloadKey((k) => k + 1)}
              disabled={traffic.busy}
            >
              <FaSyncAlt className={traffic.busy ? "tj-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="tr-hero">
          <h1>Website traffic</h1>
          <p>Who visits tlauom.com, where they come from and what they look at.</p>
        </div>

        <div className="tr-filters" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={r.id === rangeId ? "is-active" : ""}
              aria-pressed={r.id === rangeId}
              onClick={() => pickRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {traffic.status === "notsetup" && <NotSetUp />}
        {traffic.status === "error" && <p className="tr-error">{traffic.message}</p>}
        {traffic.status === "loading" && <div className="tr-loading" aria-label="Loading" />}

        {ready && (
          <div className={`tr-body${traffic.busy ? " is-busy" : ""}`}>
            {now.views === 0 && (
              <p className="tr-banner">
                No visits counted in this period yet. Counting starts from the day <code>analytics.sql</code> was run, so the
                first day will look small.
              </p>
            )}
            <StatTiles now={now} before={before} series={series} rangeLabel={rangeLabel} />
            <div className="tr-grid tr-grid-hero">
              <VisitorsChart series={series} index={1} />
              <LiveNow index={2} />
            </div>
            <div className="tr-grid">
              <Sources now={now} index={3} />
              <TopPages now={now} index={4} />
            </div>
            <BusiestTimes rows={traffic.rows} index={5} />
          </div>
        )}
      </div>
    </div>
  );
}
