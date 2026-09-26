import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaLock,
  FaWhatsapp,
  FaCheckCircle,
  FaSearch,
  FaDownload,
  FaSyncAlt,
} from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import {
  fetchTeamJoinConfig,
  saveTeamJoinConfig,
  getCachedTeamJoinConfig,
  blankField,
} from "../shared/teamJoinConfig";
import {
  fetchTeamJoinApplications,
  deleteTeamJoinApplication,
} from "../shared/teamJoinApplications";
import "./Frame.css";
import "./Admin.css";

const FIELD_TYPES = [
  { value: "text", label: "Short answer", hint: "One line of text" },
  { value: "select", label: "Dropdown", hint: "Pick one from a list" },
  { value: "textarea", label: "Paragraph", hint: "Longer free text" },
];

const typeLabel = (t) => (FIELD_TYPES.find((x) => x.value === t) || FIELD_TYPES[0]).label;

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`tj-switch${checked ? " is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="tj-switch-knob" />
    </button>
  );
}

// A field is shown as a one-line summary; clicking it opens the editor below.
// Dropdown choices are edited as plain text, one per line, which is much
// quicker than one input per option for long lists like the 25 districts.
function FieldCard({ field, index, total, open, onToggle, onChange, onDelete, onMove }) {
  const isSelect = field.type === "select";
  const choiceCount = field.options.filter((o) => o.trim()).length;

  return (
    <div className={`tj-field${open ? " is-open" : ""}`}>
      <div className="tj-field-summary">
        <button type="button" className="tj-field-toggle" onClick={onToggle} aria-expanded={open}>
          <span className="tj-field-num">{index + 1}</span>
          <span className="tj-field-name">{field.label || "Untitled question"}</span>
          <span className="tj-chip">{typeLabel(field.type)}</span>
          {isSelect && <span className="tj-chip">{choiceCount} choices</span>}
          <span className={`tj-chip ${field.required ? "tj-chip-req" : "tj-chip-opt"}`}>
            {field.required ? "Required" : "Optional"}
          </span>
          <FaChevronDown className="tj-field-caret" />
        </button>
        <div className="tj-field-tools">
          <button
            type="button"
            className="tj-tool"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            title="Move up"
            aria-label="Move up"
          >
            <FaArrowUp />
          </button>
          <button
            type="button"
            className="tj-tool"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            title="Move down"
            aria-label="Move down"
          >
            <FaArrowDown />
          </button>
          <button
            type="button"
            className="tj-tool tj-tool-del"
            onClick={onDelete}
            title="Delete question"
            aria-label="Delete question"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {open && (
        <div className="tj-field-body">
          <div className="tj-control">
            <span className="tj-control-label">Question shown to applicants</span>
            <input
              className="tj-input"
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
              placeholder="e.g. மாவட்டம் (District)"
            />
          </div>

          <div className="tj-control">
            <span className="tj-control-label">Answer type</span>
            <div className="tj-segmented" role="radiogroup">
              {FIELD_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={field.type === t.value}
                  className={field.type === t.value ? "is-active" : ""}
                  onClick={() => onChange({ ...field, type: t.value })}
                >
                  <strong>{t.label}</strong>
                  <small>{t.hint}</small>
                </button>
              ))}
            </div>
            {field.key === "team" && field.type !== "select" && (
              <span className="tj-warn">
                This is the team question — keep it as a Dropdown so WhatsApp links work.
              </span>
            )}
          </div>

          {isSelect && (
            <div className="tj-control">
              <span className="tj-control-label">
                Choices <em>— one per line ({choiceCount})</em>
              </span>
              <textarea
                className="tj-input tj-choices"
                rows={Math.min(12, Math.max(4, field.options.length + 1))}
                value={field.options.join("\n")}
                onChange={(e) => onChange({ ...field, options: e.target.value.split("\n") })}
                placeholder={"Option 1\nOption 2\nOption 3"}
              />
            </div>
          )}

          <div className="tj-control tj-control-inline">
            <span>
              <span className="tj-control-label">Required</span>
              <small className="tj-muted">Applicants can't submit without answering this.</small>
            </span>
            <Switch
              checked={field.required}
              label="Required"
              onChange={(v) => onChange({ ...field, required: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [cfg, setCfg] = useState(getCachedTeamJoinConfig);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(getCachedTeamJoinConfig()));
  const [openKey, setOpenKey] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    fetchTeamJoinConfig()
      .then((c) => {
        if (!touched.current) {
          setCfg(c);
          setSavedJson(JSON.stringify(c));
        }
      })
      .catch(() => {});
  }, []);

  const dirty = JSON.stringify(cfg) !== savedJson;

  const update = (fn) => {
    touched.current = true;
    setMsg({ type: "", text: "" });
    setCfg(fn);
  };

  const setField = (index, next) =>
    update((c) => ({ ...c, fields: c.fields.map((f, i) => (i === index ? next : f)) }));

  const removeField = (index) => {
    const f = cfg.fields[index];
    if (!window.confirm(`Delete the question "${f.label}"?`)) return;
    update((c) => ({ ...c, fields: c.fields.filter((_, i) => i !== index) }));
  };

  const moveField = (index, dir) =>
    update((c) => {
      const fields = [...c.fields];
      const j = index + dir;
      if (j < 0 || j >= fields.length) return c;
      [fields[index], fields[j]] = [fields[j], fields[index]];
      return { ...c, fields };
    });

  const addField = () => {
    const f = blankField();
    update((c) => ({ ...c, fields: [...c.fields, f] }));
    setOpenKey(f.key);
  };

  const setTeamLink = (team, value) =>
    update((c) => ({ ...c, teamLinks: { ...c.teamLinks, [team]: value } }));

  const teamField = cfg.fields.find((f) => f.key === "team" && f.type === "select");
  const teams = teamField ? teamField.options.map((o) => o.trim()).filter(Boolean) : [];
  const linkedCount = teams.filter((t) => (cfg.teamLinks[t] || "").trim()).length;

  const onSave = useCallback(
    async (e) => {
      e.preventDefault();
      setMsg({ type: "", text: "" });
      setBusy(true);
      try {
        await saveTeamJoinConfig(cfg);
        const clean = getCachedTeamJoinConfig();
        setCfg(clean);
        setSavedJson(JSON.stringify(clean));
        setMsg({ type: "ok", text: "Saved — changes are live for everyone." });
      } catch (err) {
        setMsg({ type: "err", text: err.message || "Could not save." });
      } finally {
        setBusy(false);
      }
    },
    [cfg]
  );

  return (
    <form className="tj-settings" onSubmit={onSave}>
      {/* 1. Open / closed */}
      <section className={`tj-status${cfg.enabled ? " is-open" : ""}`}>
        <div>
          <span className={`tj-pill${cfg.enabled ? " is-open" : ""}`}>
            <span className="tj-dot" /> {cfg.enabled ? "Open" : "Closed"}
          </span>
          <h3 className="tj-h3">Accepting applications</h3>
          <p className="tj-muted">
            {cfg.enabled
              ? 'The "Join our teams" box is visible on the Teams page.'
              : 'The "Join our teams" box is hidden from the Teams page.'}
          </p>
        </div>
        <Switch
          checked={cfg.enabled}
          label="Accepting applications"
          onChange={(v) => update((c) => ({ ...c, enabled: v }))}
        />
      </section>

      <div className="tj-columns">
        {/* 2. Questions */}
        <section className="tj-section">
          <header className="tj-section-head">
            <div>
              <h3 className="tj-h3">Application questions</h3>
              <p className="tj-muted">Click a question to edit it. Use the arrows to reorder.</p>
            </div>
            <button type="button" className="tj-btn" onClick={addField}>
              <FaPlus /> Add question
            </button>
          </header>

          <div className="tj-field tj-field-locked">
            <div className="tj-field-summary">
              <div className="tj-field-toggle">
                <span className="tj-field-num">
                  <FaLock />
                </span>
                <span className="tj-field-name">பெயர் (Name)</span>
                <span className="tj-chip">Short answer</span>
                <span className="tj-chip tj-chip-req">Required</span>
              </div>
              <span className="tj-muted tj-locked-note">Always asked</span>
            </div>
          </div>

          {cfg.fields.map((field, i) => (
            <FieldCard
              key={field.key}
              field={field}
              index={i}
              total={cfg.fields.length}
              open={openKey === field.key}
              onToggle={() => setOpenKey((k) => (k === field.key ? null : field.key))}
              onChange={(next) => setField(i, next)}
              onDelete={() => removeField(i)}
              onMove={(dir) => moveField(i, dir)}
            />
          ))}

          {cfg.fields.length === 0 && (
            <p className="tj-empty">No extra questions — applicants only enter their name.</p>
          )}
        </section>

        {/* 3. WhatsApp links */}
        <section className="tj-section">
          <header className="tj-section-head">
            <div>
              <h3 className="tj-h3">
                <FaWhatsapp className="tj-wa" /> WhatsApp group links
              </h3>
              <p className="tj-muted">
                After applying, people get the link for the team they picked.
              </p>
            </div>
            {teams.length > 0 && (
              <span className="tj-count">
                {linkedCount}/{teams.length} set
              </span>
            )}
          </header>

          {teams.length > 0 ? (
            <div className="tj-links">
              {teams.map((team) => {
                const has = !!(cfg.teamLinks[team] || "").trim();
                return (
                  <label key={team} className="tj-link-row">
                    <span className="tj-link-team">
                      {has ? (
                        <FaCheckCircle className="tj-ok-icon" />
                      ) : (
                        <span className="tj-missing-dot" />
                      )}
                      {team}
                    </span>
                    <input
                      className="tj-input"
                      type="url"
                      value={cfg.teamLinks[team] || ""}
                      onChange={(e) => setTeamLink(team, e.target.value)}
                      placeholder="https://chat.whatsapp.com/…"
                    />
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="tj-empty">
              Add choices to the team question (விரும்பும் அணி) to set a link for each team.
            </p>
          )}
        </section>
      </div>

      <div className={`tj-savebar${dirty ? " is-dirty" : ""}`}>
        <span
          className={`tj-savebar-msg${
            msg.type === "ok" ? " is-ok" : msg.type === "err" ? " is-err" : ""
          }`}
        >
          {msg.text || (dirty ? "You have unsaved changes" : "All changes saved")}
        </span>
        <button
          type="submit"
          className="frame-btn frame-btn-primary tj-save-btn"
          disabled={busy || !dirty}
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function csvCell(v) {
  const s = String(v == null ? "" : v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function ApplicationsTab() {
  const [cfg, setCfg] = useState(getCachedTeamJoinConfig);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchTeamJoinConfig(), fetchTeamJoinApplications()])
      .then(([c, a]) => {
        setCfg(c);
        setApps(a);
      })
      .catch((err) => setError(err.message || "Could not load applications."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (a) => {
    if (!window.confirm(`Delete the application from ${a.name}?`)) return;
    try {
      await deleteTeamJoinApplication(a.id);
      setApps((prev) => prev.filter((x) => x.id !== a.id));
    } catch (err) {
      window.alert(err.message || "Could not delete.");
    }
  };

  // Columns follow the *current* field configuration, so the table always
  // matches what the form looks like today.
  const columns = cfg.fields;
  const teamField = columns.find((f) => f.key === "team" && f.type === "select");

  const teamCounts = useMemo(() => {
    const counts = {};
    apps.forEach((a) => {
      const t = (a.answers || {}).team;
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [apps]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) => {
      const answers = a.answers || {};
      if (team && answers.team !== team) return false;
      if (!q) return true;
      return [a.name, ...Object.values(answers)].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [apps, query, team]);

  const exportCsv = () => {
    const header = ["Submitted", "Name", ...columns.map((c) => c.label)];
    const rows = visible.map((a) => [
      new Date(a.created_at).toLocaleString(),
      a.name,
      ...columns.map((c) => (a.answers || {})[c.key] || ""),
    ]);
    const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `team-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="tj-section tj-apps">
      <header className="tj-section-head">
        <div>
          <h3 className="tj-h3">Applications</h3>
          <p className="tj-muted">
            {loading
              ? "Loading…"
              : `${apps.length} total${visible.length !== apps.length ? ` · ${visible.length} shown` : ""}`}
          </p>
        </div>
        <div className="tj-head-actions">
          <button type="button" className="tj-btn tj-btn-ghost" onClick={load} disabled={loading}>
            <FaSyncAlt className={loading ? "tj-spin" : ""} /> Refresh
          </button>
          <button
            type="button"
            className="tj-btn"
            onClick={exportCsv}
            disabled={visible.length === 0}
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </header>

      {apps.length > 0 && (
        <div className="tj-filters">
          <label className="tj-search">
            <FaSearch />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, district, faculty…"
            />
          </label>
          {teamField && (
            <div className="tj-team-chips">
              <button
                type="button"
                className={`tj-filter-chip${team === "" ? " is-active" : ""}`}
                onClick={() => setTeam("")}
              >
                All <b>{apps.length}</b>
              </button>
              {teamField.options.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`tj-filter-chip${team === t ? " is-active" : ""}`}
                  onClick={() => setTeam(team === t ? "" : t)}
                >
                  {t} <b>{teamCounts[t] || 0}</b>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="tj-savebar-msg is-err">{error}</p>}

      {!loading && apps.length === 0 && !error && (
        <p className="tj-empty">No applications yet. They'll appear here as people apply.</p>
      )}

      {apps.length > 0 && visible.length === 0 && (
        <p className="tj-empty">No applications match your search.</p>
      )}

      {visible.length > 0 && (
        <div className="tj-table-wrap">
          <table className="tj-table">
            <thead>
              <tr>
                <th className="tj-col-num">#</th>
                <th>Name</th>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Submitted</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visible.map((a, i) => (
                <tr key={a.id}>
                  <td className="tj-col-num">{i + 1}</td>
                  <td className="tj-col-name">{a.name}</td>
                  {columns.map((c) => {
                    const v = (a.answers || {})[c.key] || "";
                    return (
                      <td key={c.key} title={v} className={c.type === "textarea" ? "tj-col-long" : ""}>
                        {v || <span className="tj-dash">—</span>}
                      </td>
                    );
                  })}
                  <td className="tj-col-date">
                    {new Date(a.created_at).toLocaleDateString()}
                    <small>
                      {new Date(a.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="tj-tool tj-tool-del"
                      onClick={() => onDelete(a)}
                      title="Delete application"
                      aria-label="Delete application"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminTeamJoin() {
  const [tab, setTab] = useState("settings");

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Team join · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Team join</span>
      </header>

      <div className="admin-hub admin-hub-xwide tj">
        <div className="tj-topnav">
          <Link to="/admin" className="tj-back">
            ← Dashboard
          </Link>
          <div className="tj-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "settings"}
              className={tab === "settings" ? "is-active" : ""}
              onClick={() => setTab("settings")}
            >
              Form settings
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "applications"}
              className={tab === "applications" ? "is-active" : ""}
              onClick={() => setTab("applications")}
            >
              Applications
            </button>
          </div>
        </div>

        {tab === "settings" ? <SettingsTab /> : <ApplicationsTab />}
      </div>
    </div>
  );
}
