// /admin/maintenance - switch the whole site to an "under maintenance" page
// for visitors, say what it says, and set a time it reopens by itself.
// Signed-in admins and editors keep seeing the normal site, and /admin is
// never blocked, so this can always be switched back off. Main admins only.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FaTools, FaLockOpen } from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import MaintenancePage from "../Components/maintenance/MaintenancePage";
import {
  fetchSiteStatus,
  saveSiteStatus,
  getCachedSiteStatus,
  isMaintenanceOn,
  formatReopen,
  useNow,
  DEFAULT_TITLE,
  DEFAULT_MESSAGE,
} from "../shared/siteStatus";
import "./Frame.css";
import "./Admin.css";
import "./AdminMaintenance.css";

const pad = (n) => String(n).padStart(2, "0");

// <input type="datetime-local"> works in local time without a zone.
const toInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromInput = (v) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : "";
};

const inMinutes = (m) => new Date(Date.now() + m * 60000).toISOString();
const tomorrowAt = (hour) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const QUICK = [
  ["In 30 minutes", () => inMinutes(30)],
  ["In 1 hour", () => inMinutes(60)],
  ["In 3 hours", () => inMinutes(180)],
  ["Tomorrow 9:00 am", () => tomorrowAt(9)],
];

export default function AdminMaintenance() {
  const [cfg, setCfg] = useState(getCachedSiteStatus);
  const [saved, setSaved] = useState(getCachedSiteStatus); // what visitors get now
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const touched = useRef(false); // don't let the async fetch clobber edits
  const now = useNow(15000);

  useEffect(() => {
    fetchSiteStatus()
      .then((s) => {
        setSaved(s);
        if (!touched.current) setCfg(s);
      })
      .catch(() => setMsg({ type: "err", text: "Couldn't read the current setting. Run supabase/migrations/site_status.sql first if you haven't." }));
  }, []);

  const set = (patch) => {
    touched.current = true;
    setMsg({ type: "", text: "" });
    setCfg((c) => ({ ...c, ...patch }));
  };

  const live = isMaintenanceOn(saved, now);
  const dirty = JSON.stringify(cfg) !== JSON.stringify(saved);

  const publish = useCallback(
    async (next) => {
      setMsg({ type: "", text: "" });
      if (next.enabled && next.reopensAt && Date.parse(next.reopensAt) <= Date.now()) {
        setMsg({ type: "err", text: "That reopening time has already passed - pick a later time, or clear it." });
        return;
      }
      if (next.enabled && !isMaintenanceOn(saved) &&
        !window.confirm(
          "Visitors will see the maintenance page right away.\n\nYou and every other signed-in admin or editor will still see the normal site. Turn maintenance mode on?"
        )) {
        return;
      }
      setBusy(true);
      try {
        const done = await saveSiteStatus(next);
        touched.current = false;
        setSaved(done);
        setCfg(done);
        setMsg({
          type: "ok",
          text: done.enabled
            ? "Saved - visitors see the maintenance page on their next page load, or within about a minute if they have the site open."
            : "Saved - the site is open to everyone.",
        });
      } catch (err) {
        setMsg({ type: "err", text: err.message || "Could not save." });
      } finally {
        setBusy(false);
      }
    },
    [saved]
  );

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Maintenance · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Maintenance</span>
      </header>

      <div className="admin-hub admin-hub-wide">
        <Link to="/admin" className="admin-back">
          ← Dashboard
        </Link>

        <form
          className="admin-card admin-books"
          onSubmit={(e) => {
            e.preventDefault();
            publish(cfg);
          }}
        >
          <div className="admin-info">
            <div className="admin-books-head">
              <h2 className="admin-title" style={{ textAlign: "left" }}>
                Maintenance mode
              </h2>
              <span className={`admin-status ${live ? "is-closed" : "is-open"}`}>
                {live ? "● Visitors see the maintenance page" : "● The site is open"}
              </span>
            </div>

            {live && (
              <div className="am-live">
                <FaTools aria-hidden="true" />
                <div>
                  <strong>Maintenance mode is ON.</strong>
                  <span>
                    {saved.reopensAt ? `It reopens by itself on ${formatReopen(saved.reopensAt, "en-GB")}.` : "It stays on until you switch it off."}
                  </span>
                </div>
                <button type="button" className="frame-btn frame-btn-primary" onClick={() => publish({ ...cfg, enabled: false })} disabled={busy}>
                  <FaLockOpen /> Open the site now
                </button>
              </div>
            )}

            <label className="admin-switch-row">
              <span>
                <strong>Show the maintenance page to visitors</strong>
                <small>
                  Signed-in admins and editors still see the normal site, with a small banner. This page (/admin) is
                  never blocked.
                </small>
              </span>
              <input
                type="checkbox"
                className="admin-switch"
                checked={cfg.enabled}
                onChange={(e) => set({ enabled: e.target.checked })}
              />
            </label>

            <span className="admin-label" style={{ marginTop: 14 }}>
              Reopens at (optional)
            </span>
            <input
              type="datetime-local"
              className="admin-input admin-field"
              value={toInput(cfg.reopensAt)}
              onChange={(e) => set({ reopensAt: fromInput(e.target.value) })}
            />
            <div className="am-quick">
              {QUICK.map(([label, at]) => (
                <button type="button" key={label} className="am-chip" onClick={() => set({ reopensAt: at() })}>
                  {label}
                </button>
              ))}
              <button type="button" className="am-chip" onClick={() => set({ reopensAt: "" })} disabled={!cfg.reopensAt}>
                No time
              </button>
            </div>
            <small className="am-hint">
              The site reopens by itself at this time, even if nobody switches maintenance mode off. Leave it empty to
              keep the site closed until you switch it off.
            </small>

            <span className="admin-label" style={{ marginTop: 14 }}>
              Heading (optional)
            </span>
            <input
              className="admin-input admin-field"
              value={cfg.title}
              maxLength={120}
              onChange={(e) => set({ title: e.target.value })}
              placeholder={DEFAULT_TITLE}
            />

            <span className="admin-label" style={{ marginTop: 14 }}>
              Message (optional)
            </span>
            <textarea
              className="admin-input admin-field admin-textarea"
              rows={3}
              maxLength={1000}
              value={cfg.message}
              onChange={(e) => set({ message: e.target.value })}
              placeholder={DEFAULT_MESSAGE}
            />
            <small className="am-hint">
              Leave the heading and message empty to use the built-in wording, which has Tamil and English.
            </small>

            {msg.text && <p className={msg.type === "ok" ? "admin-ok" : "admin-error"}>{msg.text}</p>}

            <div className="admin-books-actions">
              <button type="submit" className="frame-btn frame-btn-primary" disabled={busy || !dirty}>
                {busy ? "Saving…" : cfg.enabled && !live ? "Save and turn on" : "Save"}
              </button>
            </div>
          </div>
        </form>

        <section className="am-preview" aria-label="Preview">
          <div className="am-preview-bar">What visitors will see{dirty ? " (includes unsaved changes)" : ""}</div>
          <MaintenancePage status={cfg} now={now} preview />
        </section>
      </div>
    </div>
  );
}
