// Gallery section editor for /admin/teams: drag-and-drop / paste / pick
// photos, which are optimised in the browser and uploaded to Cloudinary (see
// src/shared/useImageUploads.js), plus captions, drag-to-reorder and the
// old "add by link" path for Drive/Cloudinary URLs.
import React, { useRef, useState } from "react";
import {
  FaCloudUploadAlt,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaExclamationTriangle,
  FaRedo,
  FaPlus,
  FaLink,
  FaStar,
  FaMagic,
} from "react-icons/fa";
import { SmartImage } from "../Components/teams/team-detail/media";
import { blankImage } from "../shared/teamPages";
import { imageSource, splitLinks } from "../shared/mediaLinks";
import { formatBytes } from "../shared/cloudinaryUpload";
import { useImageUploads, isImageFile } from "../shared/useImageUploads";

const ACCEPT = "image/*,.heic,.heif";
const DRAG_TYPE = "application/x-tla-photo";
const SOURCE_LABEL = { drive: "Drive", cloudinary: "Cloudinary", web: "Link", bundled: "Built-in" };
// Narrower than this and a photo can't fill a laptop screen in the lightbox
// (e.g. an image saved from a web search).
const LOW_RES = 1000;

const moveTo = (arr, from, to) => {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const a = [...arr];
  const [x] = a.splice(from, 1);
  a.splice(to, 0, x);
  return a;
};

const hasFiles = (e) => Array.from((e.dataTransfer && e.dataTransfer.types) || []).includes("Files");

function ProgressRing({ value }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg className="tg-ring" viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r={r} className="tg-ring-track" />
      <circle cx="22" cy="22" r={r} className="tg-ring-bar" strokeDasharray={c} strokeDashoffset={c * (1 - value)} />
    </svg>
  );
}

function PendingTile({ item, onRetry, onDismiss }) {
  const [broken, setBroken] = useState(false);
  const pct = Math.round(item.progress * 100);
  const saved = item.after && item.before > item.after ? Math.round((1 - item.after / item.before) * 100) : 0;
  const fmt = item.outType === "image/webp" ? "WebP" : item.outType === "image/jpeg" ? "JPEG" : "";

  return (
    <div className={`tg-tile is-pending is-${item.status}`}>
      <div className="tg-thumb">
        {item.preview && !broken && <img src={item.preview} alt="" onError={() => setBroken(true)} />}
        <div className="tg-overlay">
          {item.status === "queued" && <span className="tg-state">Waiting…</span>}
          {item.status === "preparing" && (
            <span className="tg-state">
              <FaMagic className="tg-spin-soft" /> Optimising…
            </span>
          )}
          {(item.status === "ready" || item.status === "uploading" || item.status === "done") && (
            <span className="tg-state tg-state-ring">
              <ProgressRing value={item.progress} />
              <b>{pct}%</b>
            </span>
          )}
          {item.status === "error" && (
            <span className="tg-state tg-state-err" title={item.error}>
              <FaExclamationTriangle />
              <span className="tg-err-text">{item.error}</span>
              <span className="tg-err-actions">
                {item.stage !== "type" && (
                  <button type="button" className="tg-mini" onClick={() => onRetry(item.key)}>
                    <FaRedo /> Retry
                  </button>
                )}
                <button type="button" className="tg-mini" onClick={() => onDismiss(item.key)}>
                  Remove
                </button>
              </span>
            </span>
          )}
        </div>
        {item.status !== "error" && (
          <button type="button" className="tg-x" onClick={() => onDismiss(item.key)} aria-label={`Cancel ${item.name}`} title="Cancel">
            <FaTimes />
          </button>
        )}
      </div>
      <small className="tg-meta" title={item.name}>
        {item.after ? (
          <>
            {formatBytes(item.before)} → <b>{formatBytes(item.after)}</b>
            {fmt && ` ${fmt}`}
            {saved > 0 && <span className="tg-saved">−{saved}%</span>}
          </>
        ) : (
          <>
            {item.name} · {formatBytes(item.before)}
          </>
        )}
      </small>
    </div>
  );
}

export default function GalleryEditor({ s, onUpdate }) {
  const setImages = (fn) => onUpdate((sec) => ({ ...sec, images: fn(sec.images) }));
  const up = useImageUploads({
    onDone: (r) => setImages((imgs) => [...imgs, { ...blankImage(r.url), width: r.width, height: r.height }]),
  });

  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const [drag, setDrag] = useState(null); // index being reordered
  const [dropAt, setDropAt] = useState(null);
  const [links, setLinks] = useState("");
  const [note, setNote] = useState("");
  const [showLinks, setShowLinks] = useState(false);

  const images = s.images;
  const failed = up.items.filter((x) => x.status === "error").length;
  const retryable = up.items.filter((x) => x.status === "error" && x.stage !== "type").length;
  const active = up.items.length - failed;
  const featured = images.length + active >= 5;

  const addFiles = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const n = up.add(list);
    const skipped = list.filter((f) => !isImageFile(f)).length;
    setNote(skipped ? `${skipped} file${skipped === 1 ? " isn't an image" : "s aren't images"}.` : "");
    return n;
  };

  const addLinks = (text) => {
    const found = splitLinks(text);
    if (!found.length) {
      setNote("No links found - they must start with https://");
      return;
    }
    const have = new Set(images.map((x) => x.url));
    const fresh = found.filter((u, i) => !have.has(u) && found.indexOf(u) === i);
    setImages((imgs) => [...imgs, ...fresh.map((u) => blankImage(u))]);
    setLinks("");
    const skipped = found.length - fresh.length;
    setNote(`Added ${fresh.length} photo${fresh.length === 1 ? "" : "s"}${skipped ? ` · skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}` : ""}`);
  };

  const put = (id, patch) => setImages((imgs) => imgs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id) => setImages((imgs) => imgs.filter((x) => x.id !== id));
  const shift = (i, d) => setImages((imgs) => moveTo(imgs, i, i + d));

  // Files can be dropped anywhere on the editor, not just the drop zone.
  const rootDrag = {
    onDragOver: (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      if (!over) setOver(true);
    },
    onDragLeave: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOver(false);
    },
    onDrop: (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setOver(false);
      addFiles(e.dataTransfer.files);
    },
    onPaste: (e) => {
      const files = Array.from(e.clipboardData.files || []).filter(isImageFile);
      if (files.length) {
        e.preventDefault();
        addFiles(files);
      }
    },
  };

  // The photo is the drag handle (so selecting caption text still works);
  // the whole tile is the drop target.
  const handleDrag = (i) => ({
    draggable: true,
    onDragStart: (e) => {
      setDrag(i);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(DRAG_TYPE, String(i));
    },
    onDragEnd: () => {
      setDrag(null);
      setDropAt(null);
    },
  });

  const tileDrop = (i) => ({
    onDragOver: (e) => {
      if (drag === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dropAt !== i) setDropAt(i);
    },
    onDrop: (e) => {
      if (drag === null) return;
      e.preventDefault();
      e.stopPropagation();
      setImages((imgs) => moveTo(imgs, drag, i));
      setDrag(null);
      setDropAt(null);
    },
  });

  const empty = images.length === 0 && up.items.length === 0;

  return (
    <div className={`tg${over ? " is-over" : ""}`} {...rootDrag}>
      <div
        className={`tg-drop${empty ? " is-empty" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current && inputRef.current.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current.click();
          }
        }}
      >
        <FaCloudUploadAlt className="tg-drop-icon" />
        <div className="tg-drop-text">
          <strong>{over ? "Drop to upload" : "Drop photos here, paste, or click to choose"}</strong>
          <small>
            JPG · PNG · WebP · HEIC - resized to 2560px and converted to WebP in your browser, then uploaded to
            Cloudinary. Location data is removed.
          </small>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(images.length > 0 || up.items.length > 0 || up.stats.count > 0) && (
        <div className="tg-bar">
          <span>
            <b>{images.length}</b> photo{images.length === 1 ? "" : "s"}
            {active > 0 && <> · uploading {active}</>}
            {images.length > 1 && <span className="tj-muted"> · drag to reorder</span>}
          </span>
          {up.stats.count > 0 && up.stats.before > up.stats.after && (
            <span className="tg-chip-saved" title="Size before → after browser optimisation">
              {formatBytes(up.stats.before)} → {formatBytes(up.stats.after)} · saved{" "}
              {Math.round((1 - up.stats.after / up.stats.before) * 100)}%
            </span>
          )}
          {failed > 0 && (
            <span className="tg-bar-actions">
              {retryable > 0 && (
                <button type="button" className="tg-mini" onClick={up.retryAll}>
                  <FaRedo /> Retry {retryable} failed
                </button>
              )}
              <button type="button" className="tg-mini" onClick={up.clearFailed}>
                Clear
              </button>
            </span>
          )}
        </div>
      )}

      {!empty && (
        <div className={`tg-grid${featured ? " is-featured" : ""}`}>
          {images.map((img, i) => {
            const src = imageSource(img.url);
            return (
              <div
                key={img.id}
                className={`tg-tile${drag === i ? " is-dragging" : ""}${dropAt === i && drag !== i ? " is-drop" : ""}`}
                {...tileDrop(i)}
              >
                <div className="tg-thumb" {...handleDrag(i)}>
                  <SmartImage
                    src={img.url}
                    width={480}
                    alt=""
                    draggable={false}
                    fallback={
                      <span className="tg-broken" title="Couldn't load - for Drive, share as 'Anyone with the link'">
                        <FaExclamationTriangle />
                      </span>
                    }
                  />
                  <span className="tg-index">{i + 1}</span>
                  {featured && i === 0 && (
                    <span className="tg-feature" title="Shown larger on the team page">
                      <FaStar /> Featured
                    </span>
                  )}
                  {src && src !== "cloudinary" && <span className={`tg-src ts-src-${src}`}>{SOURCE_LABEL[src]}</span>}
                  {img.width > 0 && img.width < LOW_RES && (
                    <span
                      className="tg-lowres"
                      title={`Only ${img.width}×${img.height}px - it will look small or blurry when opened. Use the original photo if you have it.`}
                    >
                      <FaExclamationTriangle /> Low-res
                    </span>
                  )}
                  <div className="tg-tools">
                    <button type="button" onClick={() => shift(i, -1)} disabled={i === 0} aria-label="Move earlier" title="Move earlier">
                      <FaArrowLeft />
                    </button>
                    <button type="button" onClick={() => shift(i, 1)} disabled={i === images.length - 1} aria-label="Move later" title="Move later">
                      <FaArrowRight />
                    </button>
                    <button type="button" className="is-del" onClick={() => remove(img.id)} aria-label="Remove photo" title="Remove photo">
                      <FaTimes />
                    </button>
                  </div>
                </div>
                <input
                  className="tj-input tg-caption"
                  value={img.caption}
                  maxLength={300}
                  placeholder="Caption (optional)"
                  onChange={(e) => put(img.id, { caption: e.target.value })}
                />
              </div>
            );
          })}
          {up.items.map((item) => (
            <PendingTile key={item.key} item={item} onRetry={up.retry} onDismiss={up.dismiss} />
          ))}
        </div>
      )}

      <div className="tg-links">
        <button type="button" className="tg-links-toggle" onClick={() => setShowLinks((v) => !v)} aria-expanded={showLinks}>
          <FaLink /> {showLinks ? "Hide" : "Add photos by link"} <span className="tj-muted">(Google Drive or Cloudinary)</span>
        </button>
        {showLinks && (
          <div className="ts-add-links">
            <textarea
              className="tj-input"
              rows={2}
              value={links}
              placeholder="Paste Google Drive or Cloudinary image links (several at once is fine)"
              onChange={(e) => {
                setLinks(e.target.value);
                setNote("");
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (splitLinks(text).length) {
                  e.preventDefault();
                  e.stopPropagation();
                  addLinks(text);
                }
              }}
            />
            <button type="button" className="tj-btn" onClick={() => addLinks(links)} disabled={!links.trim()}>
              <FaPlus /> Add
            </button>
          </div>
        )}
      </div>
      {note && <small className="tj-muted">{note}</small>}
    </div>
  );
}
