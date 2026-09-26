import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FaTrash, FaPlus } from "react-icons/fa";

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

const TYPE_LABEL = {
  text: "Text",
  select: "Dropdown",
  textarea: "Paragraph",
};

function FieldCard({ field, onChange, onDelete }) {
  const setOption = (i, value) => {
    onChange({ ...field, options: field.options.map((o, k) => (k === i ? value : o)) });
  };
  const removeOption = (i) => {
    onChange({ ...field, options: field.options.filter((_, k) => k !== i) });
  };
  const addOption = () => {
    onChange({ ...field, options: [...field.options, ""] });
  };

  return (
    <div className="tj-field-card">
      <div className="tj-field-card-head">
        <input
          className="admin-input tj-field-label-input"
          value={field.label}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
          placeholder="புலத்தின் பெயர்"
        />
        <select
          className="tj-field-type-select"
          value={field.type}
          onChange={(e) => onChange({ ...field, type: e.target.value })}
        >
          {Object.keys(TYPE_LABEL).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <label className="tj-field-required">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onChange({ ...field, required: e.target.checked })}
          />
          Required
        </label>
        <button
          type="button"
          className="admin-icon-btn admin-icon-del"
          onClick={onDelete}
          title="Delete field"
          aria-label="Delete field"
        >
          <FaTrash />
        </button>
      </div>

      {field.type === "select" && (
        <div className="tj-options-editor">
          <p className="tj-options-label">Dropdown options</p>
          {field.options.map((opt, i) => (
            <div className="tj-option-row" key={i}>
              <input
                className="admin-input admin-field"
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder="Option value"
              />
              <button
                type="button"
                className="admin-icon-btn admin-icon-del"
                onClick={() => removeOption(i)}
                title="Delete option"
                aria-label="Delete option"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button type="button" className="admin-copy admin-list-add" onClick={addOption}>
            <FaPlus /> Add option
          </button>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [cfg, setCfg] = useState(getCachedTeamJoinConfig);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    fetchTeamJoinConfig()
      .then((c) => {
        if (!touched.current) setCfg(c);
      })
      .catch(() => {});
  }, []);

  const setField = (index, next) => {
    touched.current = true;
    setCfg((c) => ({ ...c, fields: c.fields.map((f, i) => (i === index ? next : f)) }));
  };

  const removeField = (index) => {
    touched.current = true;
    setCfg((c) => ({ ...c, fields: c.fields.filter((_, i) => i !== index) }));
  };

  const addField = () => {
    touched.current = true;
    setCfg((c) => ({ ...c, fields: [...c.fields, blankField()] }));
  };

  const setTeamLink = (team, value) => {
    touched.current = true;
    setCfg((c) => ({ ...c, teamLinks: { ...c.teamLinks, [team]: value } }));
  };

  const teamField = cfg.fields.find((f) => f.key === "team" && f.type === "select");

  const onSave = useCallback(
    async (e) => {
      e.preventDefault();
      setMsg({ type: "", text: "" });
      setBusy(true);
      try {
        await saveTeamJoinConfig(cfg);
        setMsg({ type: "ok", text: "Saved and published to everyone." });
      } catch (err) {
        setMsg({ type: "err", text: err.message || "Could not save." });
      } finally {
        setBusy(false);
      }
    },
    [cfg]
  );

  return (
    <form className="admin-card admin-books admin-team-join" onSubmit={onSave}>
      <div className="admin-info" style={{ alignItems: "stretch" }}>
        <h2 className="admin-title" style={{ textAlign: "left" }}>
          Join form settings
        </h2>

        <label className="admin-switch-row">
          <span>
            <strong>Accepting applications</strong>
            <small>
              Turns the "join our teams" box on the Teams page on or off for
              everyone.
            </small>
          </span>
          <input
            type="checkbox"
            className="admin-switch"
            checked={cfg.enabled}
            onChange={(e) => {
              touched.current = true;
              setCfg((c) => ({ ...c, enabled: e.target.checked }));
            }}
          />
        </label>

        <div style={{ marginTop: 18 }}>
          <span className="admin-label" style={{ marginBottom: 10, display: "block" }}>
            Form fields (Name is always collected and always required)
          </span>
          {cfg.fields.map((field, i) => (
            <FieldCard
              key={field.key}
              field={field}
              onChange={(next) => setField(i, next)}
              onDelete={() => removeField(i)}
            />
          ))}
          <div className="tj-add-field-row">
            <button type="button" className="frame-btn frame-btn-ghost" onClick={addField}>
              <FaPlus /> Add field
            </button>
          </div>
        </div>

        {teamField && (
          <div className="admin-liststack" style={{ marginTop: 16 }}>
            <span className="admin-label">
              WhatsApp group link per team (shown after a successful application)
            </span>
            {teamField.options.map((team) => (
              <div key={team} className="admin-list-row">
                <input
                  className="admin-input admin-field"
                  value={cfg.teamLinks[team] || ""}
                  onChange={(e) => setTeamLink(team, e.target.value)}
                  placeholder={`${team} — https://chat.whatsapp.com/...`}
                />
              </div>
            ))}
          </div>
        )}

        {msg.text && (
          <p className={msg.type === "ok" ? "admin-ok" : "admin-error"}>
            {msg.text}
          </p>
        )}

        <div className="admin-books-actions">
          <button
            type="submit"
            className="frame-btn frame-btn-primary"
            disabled={busy}
          >
            {busy ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ApplicationsTab() {
  const [cfg, setCfg] = useState(getCachedTeamJoinConfig);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const onDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await deleteTeamJoinApplication(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      window.alert(err.message || "Could not delete.");
    }
  };

  // Columns follow the *current* field configuration, so the sheet always
  // matches what the form looks like today.
  const columns = cfg.fields;

  return (
    <div className="admin-card admin-books admin-team-join">
      <div className="admin-info" style={{ alignItems: "stretch" }}>
        <div className="admin-books-head">
          <h2 className="admin-title" style={{ textAlign: "left" }}>
            Applications ({apps.length})
          </h2>
          <button
            type="button"
            className="admin-copy"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {error && <p className="admin-error">{error}</p>}

        {!loading && apps.length === 0 && !error && (
          <p style={{ color: "#b3bccd", fontSize: 14 }}>No applications yet.</p>
        )}

        {apps.length > 0 && (
          <div className="tj-sheet-wrap">
            <table className="tj-sheet">
              <thead>
                <tr>
                  <th className="tj-row-num">#</th>
                  <th>Submitted</th>
                  <th>Name</th>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a, i) => (
                  <tr key={a.id}>
                    <td className="tj-row-num">{i + 1}</td>
                    <td>{new Date(a.created_at).toLocaleString()}</td>
                    <td>{a.name}</td>
                    {columns.map((c) => (
                      <td key={c.key} title={(a.answers || {})[c.key] || ""}>
                        {(a.answers || {})[c.key] || ""}
                      </td>
                    ))}
                    <td>
                      <button
                        type="button"
                        className="tj-sheet-del-btn"
                        onClick={() => onDelete(a.id)}
                        title="Delete"
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
      </div>
    </div>
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

      <div className="admin-hub admin-hub-xwide">
        <Link to="/admin" className="admin-back">
          ← Dashboard
        </Link>

        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab-btn${tab === "settings" ? " is-active" : ""}`}
            onClick={() => setTab("settings")}
          >
            Settings
          </button>
          <button
            type="button"
            className={`admin-tab-btn${tab === "applications" ? " is-active" : ""}`}
            onClick={() => setTab("applications")}
          >
            Applications
          </button>
        </div>

        {tab === "settings" ? <SettingsTab /> : <ApplicationsTab />}
      </div>
    </div>
  );
}
