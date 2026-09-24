import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import LotusDivider from "./LotusDivider";
import {
  fetchContactConfig,
  saveContactConfig,
  getCachedContactConfig,
  DEFAULT_CONTACT_CONFIG,
} from "../shared/contactConfig";
import "./Frame.css";
import "./Admin.css";

export default function AdminContact() {
  const [cfg, setCfg] = useState(getCachedContactConfig);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const touched = useRef(false); // don't let the async fetch clobber edits

  useEffect(() => {
    fetchContactConfig()
      .then((c) => {
        if (!touched.current) setCfg(c);
      })
      .catch(() => {});
  }, []);

  const set = (patch) => {
    touched.current = true;
    setCfg((c) => ({ ...c, ...patch }));
  };

  const onReset = useCallback(() => {
    if (window.confirm("Reset contact details to the built-in defaults?")) {
      touched.current = true;
      setCfg({ ...DEFAULT_CONTACT_CONFIG });
      setMsg({ type: "ok", text: "Defaults restored — click Save to apply." });
    }
  }, []);

  const onSave = useCallback(
    async (e) => {
      e.preventDefault();
      setMsg({ type: "", text: "" });
      setBusy(true);
      try {
        await saveContactConfig(cfg);
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
        <title>Contact info · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Contact info</span>
      </header>

      <div className="admin-hub admin-hub-wide">
        <Link to="/admin" className="admin-back">
          ← Dashboard
        </Link>

        <form className="admin-card admin-books" onSubmit={onSave}>
          <div className="admin-info">
            <h2 className="admin-title" style={{ textAlign: "left" }}>
              Contact details
            </h2>

            <span className="admin-label" style={{ marginTop: 14 }}>
              Email
            </span>
            <input
              type="email"
              className="admin-input admin-field"
              value={cfg.email}
              onChange={(e) => set({ email: e.target.value })}
              spellCheck={false}
            />

            <div className="admin-two-col">
              <div>
                <span className="admin-label">Phone - name</span>
                <input
                  className="admin-input admin-field"
                  value={cfg.phoneName}
                  onChange={(e) => set({ phoneName: e.target.value })}
                  placeholder="e.g. அபினேஷ்"
                />
              </div>
              <div>
                <span className="admin-label">Phone - number</span>
                <input
                  className="admin-input admin-field"
                  value={cfg.phoneNumber}
                  onChange={(e) => set({ phoneNumber: e.target.value })}
                  placeholder="076 843 2752"
                />
              </div>
            </div>

            <span className="admin-label" style={{ marginTop: 16 }}>
              Facebook URL
            </span>
            <input
              className="admin-input admin-field"
              value={cfg.facebookUrl}
              onChange={(e) => set({ facebookUrl: e.target.value })}
              spellCheck={false}
            />

            <span className="admin-label" style={{ marginTop: 14 }}>
              YouTube URL
            </span>
            <input
              className="admin-input admin-field"
              value={cfg.youtubeUrl}
              onChange={(e) => set({ youtubeUrl: e.target.value })}
              spellCheck={false}
            />

            <span className="admin-label" style={{ marginTop: 14 }}>
              Instagram URL
            </span>
            <input
              className="admin-input admin-field"
              value={cfg.instagramUrl}
              onChange={(e) => set({ instagramUrl: e.target.value })}
              spellCheck={false}
            />

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
