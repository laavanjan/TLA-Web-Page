// /admin/activity — who did what in the admin panel: every team and event
// page publish (with a summary of what changed), account changes, and deleted
// join applications. Recorded by the database (team_editors.sql) and the
// admin-users function, so it can't be skipped from a browser.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FaSyncAlt, FaUsers, FaChevronDown } from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import { fetchActivity } from "../admin/adminUsers";
import { getCachedTeamPages } from "../shared/teamPages";
import { getCachedEventPages, eventTitle as eventTitleIn } from "../shared/eventPages";
import { isBuiltIn } from "../Components/events/eventsRegistry";
import { summarizePageChange } from "../shared/pageDiff";
import { summarizeEventChange, summarizeLayoutChange } from "../shared/eventPageDiff";
import { summarizeStatusChange } from "../shared/siteStatus";
import { ACTIONS, actionMeta, actorName, activityObject, when } from "../admin/activityText";
import "./Frame.css";
import "./Admin.css";
import "./AdminEditors.css";

const PAGE = 50;

const GROUPS = [
  ["", "Everything"],
  ["pages", "Page publishes"],
  ["accounts", "Accounts & passwords"],
  ["applications", "Join applications"],
  ["site", "Site settings"],
];

const teamsLabel = (ids, teamTitle) => (ids && ids.length ? ids.map(teamTitle).join(", ") : "no teams");
const eventsLabel = (ids, eventTitle) => (ids && ids.length ? ids.map(eventTitle).join(", ") : "no events");

// Bullet points shown under an entry.
function detailLines(e, teamTitle, eventTitle) {
  const d = e.details || {};
  switch (e.action) {
    case "publish":
      return summarizePageChange(d.before, d.after);
    case "event_publish":
      return summarizeEventChange(d.before, d.after);
    case "event_layout":
      return summarizeLayoutChange(d.before, d.after, eventTitle);
    case "maintenance_on":
    case "maintenance_off":
    case "maintenance_updated":
      return summarizeStatusChange(d.before, d.after);
    case "event_removed":
      return [isBuiltIn(d.event_id) ? "Went back to the built-in content" : "Deleted the event and its page"];
    case "account_created": {
      if (d.role === "admin") return ["Main admin"];
      const parts = [];
      if (!d.teams || d.teams.length || !d.events || !d.events.length) parts.push(`teams: ${teamsLabel(d.teams, teamTitle)}`);
      if (d.events && d.events.length) parts.push(`events: ${eventsLabel(d.events, eventTitle)}`);
      return [`Editor for ${parts.join(" · ")}`];
    }
    case "account_updated":
      return Object.entries(d).map(([k, v]) => {
        if (k === "teams") return `Teams: ${teamsLabel(v.from, teamTitle)} → ${teamsLabel(v.to, teamTitle)}`;
        if (k === "events") return `Events: ${eventsLabel(v.from, eventTitle)} → ${eventsLabel(v.to, eventTitle)}`;
        if (k === "role") return `Role: ${v.from === "admin" ? "main admin" : "team editor"} → ${v.to === "admin" ? "main admin" : "team editor"}`;
        return `${k[0].toUpperCase()}${k.slice(1)}: ${v.from || "(empty)"} → ${v.to}`;
      });
    case "application_deleted":
      return [`${d.name || "Unknown"}${d.team ? ` (${d.team})` : ""}`];
    default:
      return [];
  }
}

function Entry({ e, teamTitle, eventTitle }) {
  const [open, setOpen] = useState(false);
  const meta = actionMeta(e.action);
  const Icon = meta.icon;
  const actor = actorName(e);
  const lines = detailLines(e, teamTitle, eventTitle);
  const many = lines.length > 3;
  const shown = open || !many ? lines : lines.slice(0, 3);
  const target = activityObject(e, teamTitle, eventTitle);
  const object = target ? <b>{target}</b> : null;

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
  const [event, setEvent] = useState("");
  const [group, setGroup] = useState("");

  const teams = useMemo(() => getCachedTeamPages().map((p) => ({ id: p.id, title: p.title })), []);
  const teamTitle = useCallback((id) => (teams.find((t) => t.id === id) || {}).title || `Team ${id}`, [teams]);
  const events = useMemo(() => getCachedEventPages().pages.map((p) => ({ id: p.id, title: p.title })), []);
  const eventTitle = useCallback((id) => eventTitleIn(events, id), [events]);

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
      (!event || (e.details || {}).event_id === event) &&
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
              <span className="tj-control-label">Event</span>
              <select className="tj-input" value={event} onChange={(e) => setEvent(e.target.value)}>
                <option value="">All events</option>
                {events.map((t) => (
                  <option key={t.id} value={t.id}>
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
              <Entry key={e.id} e={e} teamTitle={teamTitle} eventTitle={eventTitle} />
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
