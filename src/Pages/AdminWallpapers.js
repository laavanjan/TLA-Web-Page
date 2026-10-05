// /admin/wallpapers - the pictures that slide behind the home page heading.
// Upload new ones, hide or show them, reorder them, delete them. With one
// visible wallpaper the home page shows it still; with two or more they
// rotate every few seconds. Main admins only.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FaUpload, FaEye, FaEyeSlash, FaTrash, FaArrowUp, FaArrowDown, FaPen } from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import { prepareImage } from "../shared/imagePrep";
import { signUploads, uploadSigned, WALLPAPER_SCOPE } from "../shared/cloudinaryUpload";
import { isImageFile } from "../shared/useImageUploads";
import {
  fetchWallpapers,
  addWallpaper,
  setWallpaperVisible,
  removeWallpaper,
  saveOrder,
  updateWallpaper,
  fetchWallpaperSettings,
  saveWallpaperSettings,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TINT_COLOR,
} from "../shared/wallpapers";
import "./Frame.css";
import "./Admin.css";
import "./AdminMaintenance.css";
import "./AdminWallpapers.css";

export default function AdminWallpapers() {
  const [rows, setRows] = useState(null); // null = loading
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [uploading, setUploading] = useState(""); // "Uploading 2 of 3…"
  const [busyId, setBusyId] = useState(null);
  const fileRef = useRef(null);
  const nextOrder = useRef(0);
  const [shared, setShared] = useState(null); // saved shared text: { default_text, default_text_color }
  const [sharedDraft, setSharedDraft] = useState({ default_text: "", default_text_color: "" });
  const [editId, setEditId] = useState(null); // wallpaper whose text / colour panel is open
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWallpapers()
      .then((list) => {
        nextOrder.current = list.reduce((m, r) => Math.max(m, r.sort_order + 1), 0);
        setRows(list);
      })
      .catch(() => {
        setRows([]);
        setMsg({ type: "err", text: "Couldn't read the wallpapers. Run supabase/migrations/homepage_wallpapers.sql first if you haven't." });
      });
  }, []);

  useEffect(() => {
    fetchWallpaperSettings()
      .then((s) => {
        setShared(s);
        setSharedDraft(s);
      })
      .catch(() => {});
  }, []);

  const fail = (err) => setMsg({ type: "err", text: err.message || "Something went wrong." });

  const onFiles = useCallback(async (fileList) => {
    const files = [...fileList].filter(isImageFile);
    if (fileRef.current) fileRef.current.value = "";
    if (!files.length) {
      setMsg({ type: "err", text: "Choose image files (JPG, PNG, WebP…)." });
      return;
    }
    setMsg({ type: "", text: "" });
    let added = 0;
    let lastError = "";
    for (let i = 0; i < files.length; i += 1) {
      setUploading(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const prepared = await prepareImage(files[i]);
        const [signed] = await signUploads(WALLPAPER_SCOPE, 1);
        const up = await uploadSigned(prepared.blob, signed, { filename: files[i].name });
        const row = await addWallpaper(up, nextOrder.current);
        nextOrder.current += 1;
        setRows((cur) => [...(cur || []), row]);
        added += 1;
      } catch (err) {
        lastError = `${files[i].name}: ${err.message || "upload failed"}`;
      }
    }
    setUploading("");
    if (lastError) setMsg({ type: "err", text: lastError });
    else setMsg({ type: "ok", text: `Added ${added} wallpaper${added === 1 ? "" : "s"}. ${added === 1 ? "It is" : "They are"} live on the home page.` });
  }, []);

  const toggle = async (row) => {
    setBusyId(row.id);
    setMsg({ type: "", text: "" });
    try {
      await setWallpaperVisible(row.id, !row.is_visible);
      setRows((cur) => cur.map((r) => (r.id === row.id ? { ...r, is_visible: !row.is_visible } : r)));
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this wallpaper for good? This can't be undone.\n\nTo keep it but stop showing it, use Hide instead.")) return;
    setBusyId(row.id);
    setMsg({ type: "", text: "" });
    try {
      await removeWallpaper(row);
      setRows((cur) => cur.filter((r) => r.id !== row.id));
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index, by) => {
    const j = index + by;
    if (j < 0 || j >= rows.length) return;
    const before = rows;
    const swapped = [...rows];
    [swapped[index], swapped[j]] = [swapped[j], swapped[index]];
    setRows(swapped.map((r, i) => ({ ...r, sort_order: i })));
    setMsg({ type: "", text: "" });
    try {
      await saveOrder(swapped); // compares against each row's saved sort_order
    } catch (err) {
      setRows(before);
      fail(err);
    }
  };

  const sharedDirty = !!shared && JSON.stringify(shared) !== JSON.stringify(sharedDraft);

  const saveShared = async () => {
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const done = await saveWallpaperSettings(sharedDraft);
      setShared(done);
      setSharedDraft(done);
      setMsg({ type: "ok", text: "Shared text saved." });
    } catch (err) {
      fail(err);
    } finally {
      setSaving(false);
    }
  };

  const openEditor = (row) => {
    if (editId === row.id) {
      setEditId(null);
      return;
    }
    setEditId(row.id);
    setDraft({
      text_mode: row.text_mode,
      text: row.text,
      text_color: row.text_color,
      tint_color: row.tint_color,
      tint_opacity: row.tint_opacity,
    });
  };

  const saveDraft = async (row) => {
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const done = await updateWallpaper(row.id, draft);
      setRows((cur) => cur.map((x) => (x.id === row.id ? { ...x, ...done } : x)));
      setEditId(null);
      setMsg({ type: "ok", text: "Saved - live on the home page." });
    } catch (err) {
      fail(err);
    } finally {
      setSaving(false);
    }
  };

  const visibleCount = (rows || []).filter((r) => r.is_visible).length;

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Wallpapers · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Wallpapers</span>
      </header>

      <div className="admin-hub admin-hub-wide">
        <Link to="/admin" className="admin-back">
          ← Dashboard
        </Link>

        <div className="admin-card admin-books">
          <div className="admin-info">
            <div className="admin-books-head">
              <h2 className="admin-title" style={{ textAlign: "left" }}>
                Home page wallpapers
              </h2>
              <span className={`admin-status ${visibleCount ? "is-open" : "is-closed"}`}>
                {visibleCount
                  ? `● ${visibleCount} showing${visibleCount > 1 ? " · rotating" : ""}`
                  : "● None showing - the default picture is used"}
              </span>
            </div>
            <small className="am-hint">
              Wide pictures work best (16:9, about 1920×1080). Keep the left side calm - the heading sits on top of it.
              With two or more showing, they slide in this order, forever, every 5 seconds.
            </small>

            {shared && (
              <div className="aw-shared">
                <span className="admin-label">Shared text</span>
                <small className="am-hint">
                  Shown on every wallpaper that is set to "Shared text". Leave it empty to use the built-in verse.
                </small>
                <textarea
                  className="admin-input admin-field admin-textarea"
                  rows={3}
                  maxLength={300}
                  value={sharedDraft.default_text}
                  onChange={(e) => setSharedDraft((d) => ({ ...d, default_text: e.target.value }))}
                  placeholder="தித்திக்கும் தமிழில் நித்திலம் சொரிய…"
                />
                <ColorField
                  label="Text colour"
                  value={sharedDraft.default_text_color}
                  fallback={DEFAULT_TEXT_COLOR}
                  onChange={(v) => setSharedDraft((d) => ({ ...d, default_text_color: v }))}
                />
                <div>
                  <button type="button" className="frame-btn frame-btn-primary" onClick={saveShared} disabled={saving || !sharedDirty}>
                    Save shared text
                  </button>
                </div>
              </div>
            )}

            <div className="aw-actions">
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
              <button
                type="button"
                className="frame-btn frame-btn-primary"
                onClick={() => fileRef.current && fileRef.current.click()}
                disabled={!!uploading || rows === null}
              >
                <FaUpload /> {uploading || "Add wallpapers"}
              </button>
            </div>

            {msg.text && <p className={msg.type === "ok" ? "admin-ok" : "admin-error"}>{msg.text}</p>}

            {rows === null && <p className="am-hint">Loading…</p>}
            {rows && !rows.length && !msg.text && <p className="am-hint">No wallpapers yet - add one above.</p>}

            <ul className="aw-list">
              {(rows || []).map((r, i) => (
                <li key={r.id} className={`aw-item ${r.is_visible ? "" : "is-hidden"}`}>
                  <span className="aw-num">{i + 1}</span>
                  <img className="aw-thumb" src={r.image_url} alt="" loading="lazy" />
                  <span className="aw-state">{r.is_visible ? "Showing" : "Hidden"}</span>
                  <div className="aw-btns">
                    <button type="button" className="am-chip" onClick={() => move(i, -1)} disabled={i === 0 || busyId === r.id} aria-label="Move earlier">
                      <FaArrowUp />
                    </button>
                    <button type="button" className="am-chip" onClick={() => move(i, 1)} disabled={i === rows.length - 1 || busyId === r.id} aria-label="Move later">
                      <FaArrowDown />
                    </button>
                    <button type="button" className="am-chip" onClick={() => openEditor(r)} disabled={busyId === r.id}>
                      <FaPen /> Text &amp; colour
                    </button>
                    <button type="button" className="am-chip" onClick={() => toggle(r)} disabled={busyId === r.id}>
                      {r.is_visible ? (
                        <>
                          <FaEyeSlash /> Hide
                        </>
                      ) : (
                        <>
                          <FaEye /> Show
                        </>
                      )}
                    </button>
                    <button type="button" className="am-chip aw-danger" onClick={() => remove(r)} disabled={busyId === r.id}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                  {editId === r.id && draft && (
                    <div className="aw-editor">
                      <span className="admin-label">Heading on this wallpaper</span>
                      {[
                        ["default", "Shared text"],
                        ["custom", "Its own text"],
                        ["none", "No text"],
                      ].map(([value, label]) => (
                        <label key={value} className="admin-check-row">
                          <input type="radio" name={"mode-" + r.id} checked={draft.text_mode === value} onChange={() => setDraft((d) => ({ ...d, text_mode: value }))} />
                          {label}
                        </label>
                      ))}
                      {draft.text_mode === "custom" && (
                        <textarea
                          className="admin-input admin-field admin-textarea"
                          rows={3}
                          maxLength={300}
                          value={draft.text}
                          onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                          placeholder="Type the heading for this wallpaper"
                        />
                      )}
                      {draft.text_mode !== "none" && (
                        <ColorField
                          label="Text colour"
                          value={draft.text_color}
                          fallback={(shared && shared.default_text_color) || DEFAULT_TEXT_COLOR}
                          onChange={(v) => setDraft((d) => ({ ...d, text_color: v }))}
                          resetLabel="Use the shared colour"
                        />
                      )}
                      <ColorField
                        label="Colour tint over the picture"
                        value={draft.tint_color}
                        fallback={DEFAULT_TINT_COLOR}
                        onChange={(v) => setDraft((d) => ({ ...d, tint_color: v, tint_opacity: v && !d.tint_opacity ? 30 : d.tint_opacity }))}
                        resetLabel="No tint"
                      />
                      {draft.tint_color && (
                        <label className="aw-range">
                          Tint strength: {draft.tint_opacity}%
                          <input
                            type="range"
                            min="0"
                            max="90"
                            value={draft.tint_opacity}
                            onChange={(e) => setDraft((d) => ({ ...d, tint_opacity: Number(e.target.value) }))}
                          />
                        </label>
                      )}
                      <div className="aw-editor-actions">
                        <button type="button" className="frame-btn frame-btn-primary" onClick={() => saveDraft(r)} disabled={saving}>
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button type="button" className="am-chip" onClick={() => setEditId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// A colour picker with a "back to the default" button. value "" = the default.
function ColorField({ label, value, fallback, onChange, resetLabel = "Default" }) {
  return (
    <div className="aw-color">
      <span>{label}</span>
      <input type="color" value={value || fallback} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      <button type="button" className="am-chip" onClick={() => onChange("")} disabled={!value}>
        {resetLabel}
      </button>
    </div>
  );
}
