// The "Books" tab of /admin/books: every book on /books and /books/:slug.
// Add a book as a Google Drive link or by uploading its PDF (to Cloudinary),
// edit it, reorder, hide or delete it. Main admins only.
import React, { useEffect, useRef, useState } from "react";
import { FaUpload, FaTrash, FaArrowUp, FaArrowDown, FaPen, FaPlus, FaExternalLinkAlt, FaGoogleDrive, FaFilePdf } from "react-icons/fa";

import { prepareImage } from "../shared/imagePrep";
import { signUploads, uploadSigned, deleteImages, formatBytes, BOOK_SCOPE } from "../shared/cloudinaryUpload";
import { isImageFile } from "../shared/useImageUploads";
import {
  fetchBooks,
  saveBook,
  setBookVisibility,
  removeBook,
  saveBookOrder,
  normalizeBook,
  parseDriveId,
  driveViewLink,
  slugify,
  slugError,
  coverUrl,
  docDownloadUrl,
  CATEGORIES,
  VISIBILITIES,
} from "../book/books";
import "./AdminMaintenance.css";
import "./AdminBooksLibrary.css";

const categoryLabel = (c) => (CATEGORIES.find(([v]) => v === c) || CATEGORIES[0])[1];
const isPdfFile = (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name || "");
// Cloudinary's free plan stops at 10 MB per file; bigger books go on Drive.
const BIG_PDF = 10 * 1024 * 1024;

export default function BooksLibrary() {
  const [rows, setRows] = useState(null); // null = loading
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null); // "new" | a book id
  const nextOrder = useRef(0);

  useEffect(() => {
    fetchBooks()
      .then((list) => {
        nextOrder.current = list.reduce((m, r) => Math.max(m, r.sort_order + 1), 0);
        setRows(list);
      })
      .catch(() => {
        setRows([]);
        setMsg({ type: "err", text: "Couldn't read the books. Run supabase/migrations/books.sql first if you haven't." });
      });
  }, []);

  const fail = (err) => setMsg({ type: "err", text: err.message || "Something went wrong." });

  const onSaved = (saved, wasNew) => {
    if (wasNew) nextOrder.current += 1;
    setRows((cur) => (wasNew ? [...cur, saved] : cur.map((r) => (r.id === saved.id ? saved : r))));
    setEditing(null);
    setMsg({
      type: "ok",
      text:
        saved.visibility === "hidden"
          ? `Saved "${saved.title}". It is hidden from visitors.`
          : `Saved "${saved.title}" - live at /books/${saved.slug}.`,
    });
  };

  const changeVisibility = async (row, visibility) => {
    setBusyId(row.id);
    setMsg({ type: "", text: "" });
    try {
      await setBookVisibility(row.id, visibility);
      setRows((cur) => cur.map((r) => (r.id === row.id ? { ...r, visibility } : r)));
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete "${row.title}" for good? Its page /books/${row.slug} stops working.\n\nTo keep it but stop showing it, set it to Hidden instead.`)) return;
    setBusyId(row.id);
    setMsg({ type: "", text: "" });
    try {
      await removeBook(row);
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
      await saveBookOrder(swapped); // compares against each row's saved sort_order
    } catch (err) {
      setRows(before);
      fail(err);
    }
  };

  const listed = (rows || []).filter((r) => r.visibility === "listed").length;

  return (
    <div className="admin-card admin-books">
      <div className="admin-info">
        <div className="admin-books-head">
          <h2 className="admin-title" style={{ textAlign: "left" }}>
            Books
          </h2>
          {rows && (
            <span className={`admin-status ${listed ? "is-open" : "is-closed"}`}>
              ● {listed} on the Books page{rows.length > listed ? ` · ${rows.length - listed} link-only or hidden` : ""}
            </span>
          )}
        </div>
        <small className="am-hint">
          Each book gets its own page at tlauom.com/books/&lt;web address&gt; where visitors read and download it. Add the PDF as a
          Google Drive link or upload the file. Books show on the Books page in this order (the TLA and student sections each keep
          it).
        </small>

        <div className="ab-actions">
          <button
            type="button"
            className="frame-btn frame-btn-primary"
            onClick={() => {
              setEditing("new");
              setMsg({ type: "", text: "" });
            }}
            disabled={rows === null || editing !== null}
          >
            <FaPlus /> Add book
          </button>
        </div>

        {editing === "new" && (
          <BookEditor
            initial={null}
            sortOrder={nextOrder.current}
            onSaved={(b) => onSaved(b, true)}
            onCancel={() => setEditing(null)}
          />
        )}

        {msg.text && <p className={msg.type === "ok" ? "admin-ok" : "admin-error"}>{msg.text}</p>}

        {rows === null && <p className="am-hint">Loading…</p>}
        {rows && !rows.length && !msg.text && editing !== "new" && <p className="am-hint">No books yet - add one above.</p>}

        <ul className="ab-list">
          {(rows || []).map((r, i) => {
            const cover = coverUrl(r);
            return (
              <li key={r.id} className={`ab-item is-${r.visibility}`}>
                <span className="ab-num">{i + 1}</span>
                <div className="ab-cover">{cover ? <img src={cover} alt="" loading="lazy" /> : <FaFilePdf />}</div>
                <div className="ab-body">
                  <strong className="ab-title">{r.title || "(untitled)"}</strong>
                  <span className="ab-meta">
                    {[categoryLabel(r.category), r.year, r.author, r.page_count ? `${r.page_count} pages` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <span className="ab-tags">
                    <span className="ab-tag">
                      {r.source === "upload" ? (
                        <>
                          <FaFilePdf /> Uploaded PDF
                        </>
                      ) : (
                        <>
                          <FaGoogleDrive /> Drive
                        </>
                      )}
                    </span>
                    {r.doc_link && <span className="ab-tag">+ Word document</span>}
                    <a className="ab-link" href={`/books/${r.slug}`} target="_blank" rel="noopener noreferrer">
                      /books/{r.slug} <FaExternalLinkAlt />
                    </a>
                  </span>
                </div>
                <div className="ab-btns">
                  <select
                    className={`ab-visibility is-${r.visibility}`}
                    value={r.visibility}
                    onChange={(e) => changeVisibility(r, e.target.value)}
                    disabled={busyId === r.id}
                    aria-label="Who can see this book"
                    title={(VISIBILITIES.find(([v]) => v === r.visibility) || [])[2]}
                  >
                    {VISIBILITIES.map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="am-chip" onClick={() => move(i, -1)} disabled={i === 0 || busyId === r.id} aria-label="Move earlier">
                    <FaArrowUp />
                  </button>
                  <button type="button" className="am-chip" onClick={() => move(i, 1)} disabled={i === rows.length - 1 || busyId === r.id} aria-label="Move later">
                    <FaArrowDown />
                  </button>
                  <button
                    type="button"
                    className="am-chip"
                    onClick={() => {
                      setEditing(editing === r.id ? null : r.id);
                      setMsg({ type: "", text: "" });
                    }}
                    disabled={busyId === r.id || (editing !== null && editing !== r.id)}
                  >
                    <FaPen /> Edit
                  </button>
                  <button type="button" className="am-chip ab-danger" onClick={() => remove(r)} disabled={busyId === r.id || editing === r.id}>
                    <FaTrash /> Delete
                  </button>
                </div>
                {editing === r.id && (
                  <BookEditor initial={r} onSaved={(b) => onSaved(b, false)} onCancel={() => setEditing(null)} />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const EMPTY = normalizeBook({ year: new Date().getFullYear(), category: "tla", source: "drive", visibility: "listed" });

// The add / edit form. Files are uploaded as soon as they're picked; ones this
// form uploaded but didn't end up using are deleted again on Save or Cancel,
// and a replaced PDF or cover is deleted once the new one is saved.
function BookEditor({ initial, sortOrder = 0, onSaved, onCancel }) {
  const [draft, setDraft] = useState(() => normalizeBook(initial || EMPTY));
  const [driveLink, setDriveLink] = useState(() => (initial && initial.drive_file_id ? driveViewLink(initial.drive_file_id) : ""));
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [pdfName, setPdfName] = useState("");
  const [uploading, setUploading] = useState(""); // "pdf" | "cover"
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fresh = useRef([]); // public ids uploaded by this form
  const pdfRef = useRef(null);
  const coverRef = useRef(null);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const driveId = parseDriveId(driveLink);
  const preview = { ...draft, drive_file_id: draft.source === "drive" ? driveId : "", pdf_url: draft.source === "upload" ? draft.pdf_url : "" };
  const cover = coverUrl(preview);

  const upload = async (file, kind) => {
    setError("");
    setUploading(kind);
    setProgress(0);
    try {
      const blob = kind === "cover" ? (await prepareImage(file)).blob : file;
      const [signed] = await signUploads(BOOK_SCOPE, 1, { kind });
      const up = await uploadSigned(blob, signed, { filename: file.name, onProgress: setProgress });
      fresh.current.push(up.publicId);
      return up;
    } finally {
      setUploading("");
    }
  };

  const onPdf = async (file) => {
    if (pdfRef.current) pdfRef.current.value = "";
    if (!file) return;
    if (!isPdfFile(file)) {
      setError("Choose a PDF file.");
      return;
    }
    try {
      const up = await upload(file, "pdf");
      set({ pdf_url: up.url, pdf_public_id: up.publicId, page_count: up.pages || 0 });
      setPdfName(`${file.name} · ${formatBytes(up.bytes || file.size)}`);
    } catch (err) {
      const big = file.size > BIG_PDF ? ` This PDF is ${formatBytes(file.size)} - for big books use a Google Drive link instead.` : "";
      setError(`${file.name}: ${err.message || "upload failed"}${big}`);
    }
  };

  const onCover = async (file) => {
    if (coverRef.current) coverRef.current.value = "";
    if (!file) return;
    if (!isImageFile(file)) {
      setError("Choose an image file (JPG, PNG, WebP…) for the cover.");
      return;
    }
    try {
      const up = await upload(file, "cover");
      set({ cover_url: up.url, cover_public_id: up.publicId });
    } catch (err) {
      setError(`${file.name}: ${err.message || "upload failed"}`);
    }
  };

  const validate = () => {
    if (!draft.title.trim()) return "Give the book a title.";
    const bad = slugError(draft.slug);
    if (bad) return bad;
    if (draft.year !== null && (draft.year < 1900 || draft.year > 2100)) return "The year looks wrong.";
    if (draft.source === "drive" && !driveId) return "Paste the book's Google Drive link (or switch to Upload PDF).";
    if (draft.source === "upload" && !draft.pdf_url) return "Upload the book's PDF (or switch to Google Drive link).";
    if (draft.doc_link.trim() && !docDownloadUrl(draft)) return "The Word document link doesn't look like a Drive / Docs link.";
    return "";
  };

  const save = async (e) => {
    e.preventDefault();
    const bad = validate();
    if (bad) {
      setError(bad);
      return;
    }
    setError("");
    setSaving(true);
    try {
      const body =
        draft.source === "drive"
          ? { ...draft, drive_file_id: driveId, pdf_url: "", pdf_public_id: "", page_count: 0 }
          : { ...draft, drive_file_id: "" };
      const saved = await saveBook(initial ? { ...body, id: initial.id } : body, sortOrder);
      const keep = [saved.pdf_public_id, saved.cover_public_id];
      const old = initial ? [initial.pdf_public_id, initial.cover_public_id] : [];
      const unused = [...fresh.current, ...old].filter((id) => id && !keep.includes(id));
      fresh.current = [];
      if (unused.length) deleteImages(unused);
      onSaved(saved);
    } catch (err) {
      setError(err.message || "Could not save the book.");
      setSaving(false);
    }
  };

  const cancel = () => {
    if (fresh.current.length) deleteImages(fresh.current);
    fresh.current = [];
    onCancel();
  };

  const busy = saving || !!uploading;

  return (
    <form className="ab-editor" onSubmit={save}>
      <h3 className="ab-editor-title">{initial ? `Edit "${initial.title}"` : "Add a book"}</h3>

      <div className="ab-grid">
        <label className="ab-field ab-wide">
          <span className="admin-label">Title</span>
          <input
            className="admin-input admin-field"
            value={draft.title}
            maxLength={200}
            onChange={(e) => set(slugTouched ? { title: e.target.value } : { title: e.target.value, slug: slugify(e.target.value) })}
            placeholder="தமிழருவி'27 இதழ்"
          />
        </label>

        <label className="ab-field ab-wide">
          <span className="admin-label">Web address</span>
          <div className="ab-slug">
            <span>/books/</span>
            <input
              className="admin-input"
              value={draft.slug}
              maxLength={49}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
              }}
              placeholder="thamilaruvi27"
            />
          </div>
          {initial && draft.slug !== initial.slug && (
            <small className="am-hint ab-warn">Changing it breaks old links and QR codes that point at /books/{initial.slug}.</small>
          )}
        </label>

        <label className="ab-field">
          <span className="admin-label">Section</span>
          <select className="admin-input admin-field" value={draft.category} onChange={(e) => set({ category: e.target.value })}>
            {CATEGORIES.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="ab-field">
          <span className="admin-label">Year</span>
          <input
            type="number"
            className="admin-input admin-field"
            value={draft.year === null ? "" : draft.year}
            onChange={(e) => set({ year: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </label>

        <label className="ab-field ab-wide">
          <span className="admin-label">Author{draft.category === "tla" ? " (optional)" : ""}</span>
          <input
            className="admin-input admin-field"
            value={draft.author}
            maxLength={200}
            onChange={(e) => set({ author: e.target.value })}
            placeholder={draft.category === "student" ? "Shown under the cover on the Books page" : "Not shown for TLA publications"}
          />
        </label>

        <label className="ab-field ab-wide">
          <span className="admin-label">Short description (optional)</span>
          <textarea
            className="admin-input admin-field admin-textarea"
            rows={2}
            maxLength={500}
            value={draft.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Used by search engines and link previews"
          />
        </label>
      </div>

      <span className="admin-label ab-gap">The book's PDF</span>
      <div className="admin-tabs ab-source">
        <button type="button" className={`admin-tab-btn ${draft.source === "drive" ? "is-active" : ""}`} onClick={() => set({ source: "drive" })}>
          <FaGoogleDrive /> Google Drive link
        </button>
        <button type="button" className={`admin-tab-btn ${draft.source === "upload" ? "is-active" : ""}`} onClick={() => set({ source: "upload" })}>
          <FaFilePdf /> Upload PDF
        </button>
      </div>

      {draft.source === "drive" ? (
        <div className="ab-field ab-wide">
          <input
            className="admin-input admin-field"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/file/d/…/view?usp=sharing"
          />
          {driveLink.trim() && !driveId && <small className="am-hint ab-warn">That doesn't look like a Google Drive file link.</small>}
          {driveId && (
            <small className="am-hint">
              File found.{" "}
              <a href={driveViewLink(driveId)} target="_blank" rel="noopener noreferrer">
                Open it in Drive
              </a>{" "}
              to check it's the right one.
            </small>
          )}
          <small className="am-hint">
            In Drive: Share → General access → <strong>Anyone with the link</strong> (Viewer), or visitors will see "access
            denied".
          </small>
        </div>
      ) : (
        <div className="ab-field ab-wide">
          <input ref={pdfRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => onPdf(e.target.files[0])} />
          <div className="ab-upload-row">
            <button type="button" className="frame-btn frame-btn-ghost" onClick={() => pdfRef.current && pdfRef.current.click()} disabled={busy}>
              <FaUpload />{" "}
              {uploading === "pdf" ? `Uploading… ${Math.round(progress * 100)}%` : draft.pdf_url ? "Replace PDF" : "Choose PDF"}
            </button>
            {draft.pdf_url && uploading !== "pdf" && (
              <a href={draft.pdf_url} target="_blank" rel="noopener noreferrer" className="ab-link">
                {pdfName || "Current PDF"} <FaExternalLinkAlt />
              </a>
            )}
          </div>
          <small className="am-hint">Up to about 10 MB. For bigger books use a Google Drive link.</small>
        </div>
      )}

      <label className="ab-field ab-wide ab-gap">
        <span className="admin-label">Word document (optional)</span>
        <input
          className="admin-input admin-field"
          value={draft.doc_link}
          onChange={(e) => set({ doc_link: e.target.value })}
          placeholder="Google Docs or Drive link - adds a 'Document பதிவிறக்க' button"
        />
      </label>

      <span className="admin-label ab-gap">Cover</span>
      <div className="ab-cover-row">
        <div className="ab-cover ab-cover-lg">{cover ? <img src={cover} alt="" /> : <FaFilePdf />}</div>
        <div className="ab-cover-actions">
          <input ref={coverRef} type="file" accept="image/*" hidden onChange={(e) => onCover(e.target.files[0])} />
          <button type="button" className="frame-btn frame-btn-ghost" onClick={() => coverRef.current && coverRef.current.click()} disabled={busy}>
            <FaUpload /> {uploading === "cover" ? `Uploading… ${Math.round(progress * 100)}%` : draft.cover_url ? "Replace cover" : "Upload cover"}
          </button>
          {draft.cover_url && (
            <button type="button" className="am-chip" onClick={() => set({ cover_url: "", cover_public_id: "" })} disabled={busy}>
              Use the first page instead
            </button>
          )}
          <small className="am-hint">
            {draft.cover_url ? "A portrait picture (about 3:4) looks best." : "No cover picked - the PDF's first page is used."}
          </small>
        </div>
      </div>

      <span className="admin-label ab-gap">Who can see it</span>
      {VISIBILITIES.map(([v, label, hint]) => (
        <label key={v} className="admin-check-row">
          <input type="radio" name={`vis-${initial ? initial.id : "new"}`} checked={draft.visibility === v} onChange={() => set({ visibility: v })} />
          <span>
            <strong>{label}</strong> - {hint}
          </span>
        </label>
      ))}

      {error && <p className="admin-error">{error}</p>}

      <div className="ab-editor-actions">
        <button type="submit" className="frame-btn frame-btn-primary" disabled={busy}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add book"}
        </button>
        <button type="button" className="am-chip" onClick={cancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}
