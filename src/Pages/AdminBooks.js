import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaTrash } from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import {
  fetchBookConfig,
  saveBookConfig,
  getCachedConfig,
  isSubmissionOpen,
  DEFAULT_BOOK_CONFIG,
} from "../book/bookConfig";
import "./Frame.css";
import "./Admin.css";

// An editable list of options — each can be renamed, hidden (kept but not shown
// in the form) or deleted.
function ListEditor({ label, items, onChange }) {
  const setItem = (i, patch) =>
    onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, k) => k !== i));
  const add = () => onChange([...items, { name: "", hidden: false }]);
  return (
    <div className="admin-liststack">
      <span className="admin-label">{label}</span>
      {items.map((it, i) => (
        <div className={`admin-list-row ${it.hidden ? "is-hidden" : ""}`} key={i}>
          <input
            className="admin-input admin-field"
            value={it.name}
            onChange={(e) => setItem(i, { name: e.target.value })}
          />
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => setItem(i, { hidden: !it.hidden })}
            title={it.hidden ? "Hidden — click to show in the form" : "Shown — click to hide"}
            aria-label={it.hidden ? "Show option" : "Hide option"}
          >
            {it.hidden ? <FaEyeSlash /> : <FaEye />}
          </button>
          <button
            type="button"
            className="admin-icon-btn admin-icon-del"
            onClick={() => remove(i)}
            title="Delete"
            aria-label="Delete option"
          >
            <FaTrash />
          </button>
        </div>
      ))}
      <button type="button" className="admin-copy admin-list-add" onClick={add}>
        + Add
      </button>
    </div>
  );
}

// Editable list of contact people ({ name, phone }).
function ContactsEditor({ items, onChange }) {
  const setItem = (i, patch) =>
    onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, k) => k !== i));
  const add = () => onChange([...items, { name: "", phone: "" }]);
  return (
    <div className="admin-liststack">
      <span className="admin-label">Contact people</span>
      {items.map((it, i) => (
        <div className="admin-list-row" key={i}>
          <input
            className="admin-input admin-contact-name"
            value={it.name}
            placeholder="Name"
            onChange={(e) => setItem(i, { name: e.target.value })}
          />
          <input
            className="admin-input admin-contact-phone"
            value={it.phone}
            placeholder="Phone"
            inputMode="tel"
            onChange={(e) => setItem(i, { phone: e.target.value })}
          />
          <button
            type="button"
            className="admin-icon-btn admin-icon-del"
            onClick={() => remove(i)}
            title="Delete"
            aria-label="Delete contact"
          >
            <FaTrash />
          </button>
        </div>
      ))}
      <button type="button" className="admin-copy admin-list-add" onClick={add}>
        + Add contact
      </button>
    </div>
  );
}

export default function AdminBooks() {
  const [cfg, setCfg] = useState(getCachedConfig);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const touched = useRef(false); // don't let the async fetch clobber edits

  useEffect(() => {
    fetchBookConfig()
      .then((c) => {
        if (!touched.current) setCfg(c);
      })
      .catch(() => {});
  }, []);

  const set = (patch) => {
    touched.current = true;
    setCfg((c) => ({ ...c, ...patch }));
  };
  const openNow = isSubmissionOpen(cfg);

  const onReset = useCallback(() => {
    if (
      window.confirm(
        "Reset all book-submission settings (including the option lists) to the built-in defaults?"
      )
    ) {
      touched.current = true;
      setCfg(JSON.parse(JSON.stringify(DEFAULT_BOOK_CONFIG)));
      setMsg({ type: "ok", text: "Defaults restored — click Save to apply." });
    }
  }, []);

  const onSave = useCallback(
    async (e) => {
      e.preventDefault();
      setMsg({ type: "", text: "" });
      setBusy(true);
      try {
        const cleanList = (list) =>
          list
            .map((o) => ({ name: String(o.name).trim(), hidden: !!o.hidden }))
            .filter((o) => o.name);
        const clean = {
          ...cfg,
          workTypes: cleanList(cfg.workTypes),
          faculties: cleanList(cfg.faculties),
          contacts: (cfg.contacts || [])
            .map((c) => ({ name: String(c.name).trim(), phone: String(c.phone).trim() }))
            .filter((c) => c.name || c.phone),
          maxDocMB: Math.max(1, Number(cfg.maxDocMB) || 1),
          maxPhotoMB: Math.max(1, Number(cfg.maxPhotoMB) || 1),
        };
        await saveBookConfig(clean);
        setCfg(clean);
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
    <div className="frame-page admin-page">
      <Helmet>
        <title>Book submissions · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Book submissions</span>
      </header>

      <div className="admin-hub admin-hub-wide">
        <Link to="/admin" className="admin-back">
          ← Dashboard
        </Link>

        <form className="admin-card admin-books" onSubmit={onSave}>
          <div className="admin-info">
            <div className="admin-books-head">
              <h2 className="admin-title" style={{ textAlign: "left" }}>
                Submission settings
              </h2>
              <span className={`admin-status ${openNow ? "is-open" : "is-closed"}`}>
                {openNow ? "● Currently open" : "● Currently closed"}
              </span>
            </div>

            <label className="admin-switch-row">
              <span>
                <strong>Accepting submissions</strong>
                <small>
                  Published to everyone on save. A separate hard override
                  (SUBMISSIONS_OPEN in src/book/bookConfig.js) can force this
                  closed regardless of this switch.
                </small>
              </span>
              <input
                type="checkbox"
                className="admin-switch"
                checked={cfg.open}
                onChange={(e) => set({ open: e.target.checked })}
              />
            </label>

            <span className="admin-label" style={{ marginTop: 14 }}>
              Deadline
            </span>
            <input
              type="date"
              className="admin-input admin-field"
              value={cfg.deadline || ""}
              onChange={(e) => set({ deadline: e.target.value })}
            />
            <label className="admin-check-row">
              <input
                type="checkbox"
                checked={cfg.autoCloseOnDeadline}
                onChange={(e) => set({ autoCloseOnDeadline: e.target.checked })}
              />
              <span>Automatically close after the deadline</span>
            </label>

            <span className="admin-label" style={{ marginTop: 14 }}>
              Announcement (optional)
            </span>
            <textarea
              className="admin-input admin-field admin-textarea"
              rows={2}
              value={cfg.announcement}
              onChange={(e) => set({ announcement: e.target.value })}
              placeholder="e.g. Deadline extended to March 15"
            />

            <div className="admin-two-col">
              <div>
                <span className="admin-label">Max document (MB)</span>
                <input
                  type="number"
                  min="1"
                  className="admin-input admin-field"
                  value={cfg.maxDocMB}
                  onChange={(e) => set({ maxDocMB: e.target.value })}
                />
              </div>
              <div>
                <span className="admin-label">Max photo (MB)</span>
                <input
                  type="number"
                  min="1"
                  className="admin-input admin-field"
                  value={cfg.maxPhotoMB}
                  onChange={(e) => set({ maxPhotoMB: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <ListEditor
                label="Work type options"
                items={cfg.workTypes}
                onChange={(workTypes) => set({ workTypes })}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <ListEditor
                label="Faculty options"
                items={cfg.faculties}
                onChange={(faculties) => set({ faculties })}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <ContactsEditor
                items={cfg.contacts || []}
                onChange={(contacts) => set({ contacts })}
              />
            </div>

            {msg.text && (
              <p className={msg.type === "ok" ? "admin-ok" : "admin-error"}>
                {msg.text}
              </p>
            )}

            <div className="admin-books-actions">
              <button
                type="button"
                className="frame-btn frame-btn-ghost"
                onClick={onReset}
              >
                Reset to defaults
              </button>
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
      </div>
    </div>
  );
}
