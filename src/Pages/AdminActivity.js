// /admin/activity — who did what in the admin panel: every team page
// publish (with a summary of what changed), account changes, and deleted
// join applications. Recorded by the database (team_editors.sql) and the
// admin-users function, so it can't be skipped from a browser.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  FaUpload,
  FaUserPlus,
  FaUserEdit,
  FaKey,
  FaEye,
  FaBan,
  FaCheckCircle,
  FaTrash,
  FaUserMinus,
  FaSyncAlt,
  FaUsers,
  FaChevronDown,
} from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import { fetchActivity } from "../admin/adminUsers";
import { getCachedTeamPages } from "../shared/teamPages";
import { summarizePageChange } from "../shared/pageDiff";
import "./Frame.css";
import "./Admin.css";
import "./AdminEditors.css";

const PAGE = 50;

const ACTIONS = {
  publish: { icon: FaUpload, verb: "published", group: "pages" },
  application_deleted: { icon: FaTrash, verb: "deleted a join application", group: "applications" },
  account_created: { icon: FaUserPlus, verb: "created an account for", group: "accounts" },
  account_updated: { icon: FaUserEdit, verb: "updated the account of", group: "accounts" },
  account_removed: { icon: FaUserMinus, verb: "removed the account of", group: "accounts" },
  account_disabled: { icon: FaBan, verb: "disabled", group: "accounts" },
  account_enabled: { icon: FaCheckCircle, verb: "re-enabled", group: "accounts" },
  password_reset: { icon: FaKey, verb: "reset the password of", group: "accounts" },
  password_viewed: { icon: FaEye, verb: "viewed the password of", group: "accounts" },
  password_changed: { icon: FaKey, verb: "changed their own password", group: "accounts" },
};

const GROUPS = [
  ["", "Everything"],
  ["pages", "Page publishes"],
  ["accounts", "Accounts & passwords"],
  ["applications", "Join applications"],
];

function when(iso) {
  const d = new Date(iso);
  const s = (Date.now() - d.getTime()) / 1000;
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400 && d.getDate() === new Date().getDate()) return `today ${time}`;
  return `${d.toLocaleDateString()} ${time}`;
}

const teamsLabel = (ids, teamTitle) => (ids && ids.length ? ids.map(teamTitle).join(", ") : "no teams");

// Bullet points shown under an entry.
function detailLines(e, teamTitle) {
  const d = e.details || {};
  switch (e.action) {
    case "publish":
      return summarizePageChange(d.before, d.after);
    case "account_created":
      return [d.role === "admin" ? "Main admin" : `Team editor for ${teamsLabel(d.teams, teamTitle)}`];
    case "account_updated":
      return Object.entries(d).map(([k, v]) => {
        if (k === "teams") return `Teams: ${teamsLabel(v.from, teamTitle)} → ${teamsLabel(v.to, teamTitle)}`;
        if (k === "role") return `Role: ${v.from === "admin" ? "main admin" : "team editor"} → ${v.to === "admin" ? "main admin" : "team editor"}`;
        return `${k[0].toUpperCase()}${k.slice(1)}: ${v.from || "(empty)"} → ${v.to}`;
      });
    case "application_deleted":
      return [`${d.name || "Unknown"}${d.team ? ` (${d.team})` : ""}`];
    default:
      return [];
  }
}

function Entry({ e, teamTitle }) {
  const [open, setOpen] = useState(false);
  const meta = ACTIONS[e.action] || { icon: FaUserEdit, verb: e.action };
  const Icon = meta.icon;
  const actor = e.actor_name || e.actor_email || "Someone";
  const lines = detailLines(e, teamTitle);
  const many = lines.length > 3;
  const shown = open || !many ? lines : lines.slice(0, 3);

  let object = null;
  if (e.action === "publish") object = <b>{teamTitle(e.team_id)}</b>;
  else if (e.target_email && e.action !== "password_changed") object = <b>{e.target_email}</b>;

  return (
    <li className={`ae-entry ae-act-${meta.group || "other"}`}>
      <span className="ae-entry-icon">
        <Icon />
      </span>
      <div className="ae-entry-body">
        <div className="ae-entry-line">
          <span>
            <b title={e.actor_email}>{actor}</b> {meta.verb}
            {object && <> {object}</>}
            {e.action === "application_deleted" && e.team_id ? <> from <b>{teamTitle(e.team_id)}</b></> : null}
          </span>
          <time dateTime={e.created_at} title={new Date(e.created_at).toLocaleString()}>
            {when(e.created_at)}
          </time>
        </div>
        {shown.length > 0 && (
          <ul className="ae-entry-details">
            {shown.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        )}
        {many && (
          <button type="button" className="ae-more" onClick={() => setOpen((v) => !v)}>
            {open ? "Show less" : `Show all ${lines.length} changes`} <FaChevronDown className={open ? "is-up" : ""} />
          </button>
        )}
      </div>
    </li>
  );
}

export default function AdminActivity() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [more, setMore] = useState(false);
  const [person, setPerson] = useState("");
  const [team, setTeam] = useState("");
  const [group, setGroup] = useState("");

  const teams = useMemo(() => getCachedTeamPages().map((p) => ({ id: p.id, title: p.title })), []);
  const teamTitle = useCallback((id) => (teams.find((t) => t.id === id) || {}).title || `Team ${id}`, [teams]);

  const load = useCallback((before) => {
    setLoading(true);
    fetchActivity({ before, limit: PAGE })
      .then((rows) => {
        setEntries((prev) => (before ? [...prev, ...rows] : rows));
        setMore(rows.length === PAGE);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const people = useMemo(() => {
    const m = new Map();
    entries.forEach((e) => {
      if (e.actor_id && !m.has(e.actor_id)) m.set(e.actor_id, e.actor_name || e.actor_email || "Unknown");
    });
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [entries]);

  const visible = entries.filter(
    (e) =>
      (!person || e.actor_id === person) &&
      (!team || String(e.team_id) === team) &&
      (!group || (ACTIONS[e.action] || {}).group === group)
  );

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Activity · Admin</title>
      </Helmet>
      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Activity log</span>
      </header>

      <div className="admin-hub admin-hub-xwide tj ae">
        <div className="tj-topnav">
          <Link to="/admin" className="tj-back">
            ← Dashboard
          </Link>
          <div className="ae-top-actions">
            <Link to="/admin/editors" className="tj-btn tj-btn-ghost">
              <FaUsers /> Team editors
            </Link>
            <button type="button" className="tj-btn tj-btn-ghost" onClick={() => load()} disabled={loading}>
              <FaSyncAlt className={loading ? "tj-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <section className="tj-section">
          <div className="ae-filters">
            <label className="tj-control">
              <span className="tj-control-label">Person</span>
              <select className="tj-input" value={person} onChange={(e) => setPerson(e.target.value)}>
                <option value="">Everyone</option>
                {people.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="tj-control">
              <span className="tj-control-label">Team</span>
              <select className="tj-input" value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="">All teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="tj-control">
              <span className="tj-control-label">Type</span>
              <select className="tj-input" value={group} onChange={(e) => setGroup(e.target.value)}>
                {GROUPS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="tj-savebar-msg is-err">{error}</p>}
          {!loading && !error && visible.length === 0 && (
            <p className="tj-empty">{entries.length ? "Nothing matches these filters." : "No activity yet. Publishes and account changes will show up here."}</p>
          )}

          <ul className="ae-timeline">
            {visible.map((e) => (
              <Entry key={e.id} e={e} teamTitle={teamTitle} />
            ))}
          </ul>

          {more && (
            <button
              type="button"
              className="tj-btn tj-btn-ghost ae-load-more"
              onClick={() => load(entries[entries.length - 1].created_at)}
              disabled={loading}
            >
              {loading ? "Loading…" : "Load older activity"}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
