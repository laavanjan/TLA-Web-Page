import React, { useCallback, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import LotusDivider from "./LotusDivider";
import { DESIGNS } from "../assets/frame/designs";
import { getEnabledStickerIds, setEnabledStickerIds } from "../admin/adminStore";
import "./Frame.css";
import "./Admin.css";

export default function AdminStickers() {
  // enabled = Set of ids; null stored means "all enabled".
  const [enabled, setEnabled] = useState(() => {
    const ids = getEnabledStickerIds();
    return new Set(ids || DESIGNS.map((d) => d.id));
  });

  const persist = useCallback((set) => {
    setEnabledStickerIds([...set]);
  }, []);

  const toggle = useCallback(
    (id) => {
      setEnabled((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          if (next.size <= 1) return prev; // keep at least one enabled
          next.delete(id);
        } else {
          next.add(id);
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const enabledCount = enabled.size;
  const allOn = useMemo(() => enabledCount === DESIGNS.length, [enabledCount]);

  const setAll = useCallback(
    (on) => {
      const next = on ? new Set(DESIGNS.map((d) => d.id)) : new Set([DESIGNS[0].id]);
      persist(next);
      setEnabled(next);
    },
    [persist]
  );

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Stickers · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Stickers</span>
      </header>

      <div className="admin-hub">
        <Link to="/admin" className="admin-back">
          ← Dashboard
        </Link>

        <div className="admin-card admin-stickers-card">
          <div className="admin-stickers-head">
            <div>
              <h2 className="admin-title" style={{ textAlign: "left" }}>
                Choose stickers
              </h2>
              <p
                className="admin-desc"
                style={{ textAlign: "left", margin: "6px 0 0" }}
              >
                Pick which designs appear in the editor. {enabledCount} of{" "}
                {DESIGNS.length} shown.
              </p>
            </div>
            <button
              type="button"
              className="admin-copy admin-all-btn"
              onClick={() => setAll(!allOn)}
            >
              {allOn ? "Clear all" : "Select all"}
            </button>
          </div>

          <div className="admin-sticker-grid">
            {DESIGNS.map((d) => {
              const on = enabled.has(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`admin-sticker ${on ? "is-on" : ""}`}
                  onClick={() => toggle(d.id)}
                  aria-pressed={on}
                >
                  <span className="admin-sticker-thumb">
                    <img src={d.src} alt={d.label} draggable={false} />
                  </span>
                  <span className="admin-sticker-label">{d.label}</span>
                  <span className="admin-sticker-toggle" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
