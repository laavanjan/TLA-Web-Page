// Editing pieces shared by the team-page and event-page admins
// (/admin/teams, /admin/events): rows with move/delete tools, labelled fields,
// the image box with upload, link lists for YouTube / Instagram / social, the
// text, milestones and competitions editors, and the collapsible section card
// and "Add a section" picker.
import React, { useRef, useState } from "react";
import {
  FaTrash,
  FaPlus,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInstagram,
  FaImage,
  FaTimes,
  FaCloudUploadAlt,
  FaRedo,
} from "react-icons/fa";

import { SmartImage } from "../Components/teams/team-detail/media";
import { SOCIAL_META } from "../Components/teams/socialMeta";
import { blankTimelineItem, blankCompetition, competitionStatus } from "../shared/teamPages";
import { useImageUploads } from "../shared/useImageUploads";
import {
  youTubeId,
  youTubeThumb,
  instagramPost,
  imageSource,
  splitLinks,
  safeSocialUrl,
  socialPlatform,
  uploadedImage,
} from "../shared/mediaLinks";

export const setAt = (arr, i, v) => arr.map((x, k) => (k === i ? v : x));
export const removeAt = (arr, i) => arr.filter((_, k) => k !== i);
export const move = (arr, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const a = [...arr];
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export function ago(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}

export function RowTools({ index, total, onMove, onRemove, label }) {
  return (
    <div className="ts-row-tools">
      <button type="button" className="tj-tool" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}>
        <FaArrowUp />
      </button>
      <button type="button" className="tj-tool" onClick={() => onMove(1)} disabled={index === total - 1} aria-label={`Move ${label} down`}>
        <FaArrowDown />
      </button>
      <button type="button" className="tj-tool tj-tool-del" onClick={onRemove} aria-label={`Remove ${label}`}>
        <FaTrash />
      </button>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="tj-control">
      <span className="tj-control-label">{label}</span>
      {children}
      {hint && <small className="tj-muted">{hint}</small>}
    </label>
  );
}

// ---- Images ---------------------------------------------------------------

const SOURCE_LABEL = { drive: "Google Drive", cloudinary: "Cloudinary", web: "Web link", bundled: "Built into the site" };

export function ImageField({ label, value, onChange }) {
  const src = imageSource(value);
  const bad = value.trim() && !src;
  const fileRef = useRef(null);
  const up = useImageUploads({ concurrency: 1, onDone: (r) => onChange(r.url) });
  const item = up.items[0];
  const busy = item && item.status !== "error";

  return (
    <div className="tj-control">
      {label && <span className="tj-control-label">{label}</span>}
      <div className="ts-image-field">
        <div className={`ts-thumb${busy ? " is-uploading" : ""}`}>
          {busy && (
            <span className="ts-thumb-progress">
              {item.status === "uploading" ? `${Math.round(item.progress * 100)}%` : "…"}
              <i style={{ width: `${Math.round(item.progress * 100)}%` }} />
            </span>
          )}
          {busy && item.preview ? (
            <img src={item.preview} alt="" />
          ) : src ? (
            <SmartImage
              src={value}
              width={400}
              alt=""
              fallback={
                <span className="ts-thumb-err" title="Couldn't load - for Drive, share as 'Anyone with the link'">
                  <FaExclamationTriangle />
                </span>
              }
            />
          ) : (
            <span className="ts-thumb-empty">
              <FaImage />
            </span>
          )}
        </div>
        <div className="ts-image-input">
          <div className="ts-image-row">
            <input
              className="tj-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Upload, or paste a Google Drive / Cloudinary link"
            />
            <button
              type="button"
              className="tj-btn tj-btn-ghost ts-upload-btn"
              onClick={() => fileRef.current && fileRef.current.click()}
              disabled={!!busy}
              title="Upload an image"
            >
              <FaCloudUploadAlt /> {busy ? (item.status === "preparing" ? "Optimising…" : "Uploading…") : "Upload"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.heic,.heif"
              hidden
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                e.target.value = "";
                if (!f) return;
                up.clearFailed();
                up.add([f]);
              }}
            />
          </div>
          {src && (
            <span className={`ts-src ts-src-${src}`}>{uploadedImage(value) ? "Uploaded to Cloudinary" : SOURCE_LABEL[src]}</span>
          )}
          {bad && <span className="tj-warn">Links must start with https://</span>}
          {item && item.status === "error" && (
            <span className="tj-warn ts-upload-err">
              <FaExclamationTriangle /> {item.error}
              {item.stage !== "type" && (
                <button type="button" className="tg-mini" onClick={() => up.retry(item.key)}>
                  <FaRedo /> Retry
                </button>
              )}
              <button type="button" className="tg-mini" onClick={() => up.dismiss(item.key)}>
                Dismiss
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Link lists (YouTube / Instagram / social) ----------------------------

const LINK_KINDS = {
  youtube: {
    check: youTubeId,
    noun: "video",
    bad: "Not a YouTube video link",
    placeholder: "Paste YouTube links - youtube.com/watch?v=…, youtu.be/…, /shorts/… (several at once is fine)",
  },
  instagram: {
    check: instagramPost,
    noun: "post",
    bad: "Not an Instagram post or reel link",
    placeholder: "Paste Instagram post or reel links - instagram.com/p/… or /reel/… (several at once is fine)",
  },
  social: {
    check: socialPlatform,
    clean: safeSocialUrl,
    noun: "link",
    bad: "Not a valid https:// link or email",
    placeholder: "Paste profile links - Facebook, Instagram, YouTube, LinkedIn, TikTok, X, WhatsApp, a website or an email",
  },
};

function LinkPreview({ kind, url }) {
  if (kind === "social") {
    const key = socialPlatform(url);
    if (!key) return <FaExclamationTriangle className="ts-bad-icon" />;
    const Icon = SOCIAL_META[key].icon;
    return (
      <span className="ts-social-badge" style={{ background: SOCIAL_META[key].color }}>
        <Icon />
      </span>
    );
  }
  if (kind === "youtube") {
    const id = youTubeId(url);
    return id ? <img src={youTubeThumb(id)} alt="" /> : <FaExclamationTriangle className="ts-bad-icon" />;
  }
  if (kind === "instagram") {
    return instagramPost(url) ? (
      <span className="ts-ig-badge">
        <FaInstagram />
      </span>
    ) : (
      <FaExclamationTriangle className="ts-bad-icon" />
    );
  }
  return imageSource(url) ? (
    <SmartImage src={url} width={300} alt="" fallback={<FaExclamationTriangle className="ts-bad-icon" />} />
  ) : (
    <FaExclamationTriangle className="ts-bad-icon" />
  );
}

function linkStatus(kind, url) {
  const k = LINK_KINDS[kind];
  const ok = k.check(url);
  if (!ok) return { ok: false, text: k.bad };
  if (kind === "youtube") return { ok: true, text: `YouTube video · ${ok}` };
  if (kind === "instagram") return { ok: true, text: `Instagram ${ok.kind} · ${ok.code}` };
  if (kind === "social") return { ok: true, text: SOCIAL_META[ok].label };
  return { ok: true, text: SOURCE_LABEL[ok] };
}

export function LinkList({ kind, links, onChange }) {
  const [paste, setPaste] = useState("");
  const [note, setNote] = useState("");
  const k = LINK_KINDS[kind];

  const add = (text) => {
    const found = splitLinks(text, k.clean);
    if (!found.length) {
      setNote("No links found - they must start with https://");
      return;
    }
    const fresh = found.filter((u, i) => !links.includes(u) && found.indexOf(u) === i);
    onChange([...links, ...fresh]);
    setPaste("");
    const skipped = found.length - fresh.length;
    setNote(
      `Added ${fresh.length} ${k.noun}${fresh.length === 1 ? "" : "s"}` +
        (skipped ? ` · skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}` : "")
    );
  };

  return (
    <div className="ts-links">
      {links.map((url, i) => {
        const st = linkStatus(kind, url);
        return (
          <div className={`ts-link-row${st.ok ? "" : " is-bad"}`} key={i}>
            <div className={`ts-link-thumb ts-link-thumb-${kind}`}>
              <LinkPreview kind={kind} url={url} />
            </div>
            <div className="ts-link-main">
              <input
                className="tj-input"
                value={url}
                onChange={(e) => onChange(setAt(links, i, e.target.value))}
              />
              <small className={st.ok ? "ts-ok" : "ts-bad"}>
                {st.ok ? <FaCheckCircle /> : <FaExclamationTriangle />} {st.text}
              </small>
            </div>
            <RowTools
              index={i}
              total={links.length}
              label={k.noun}
              onMove={(d) => onChange(move(links, i, d))}
              onRemove={() => onChange(removeAt(links, i))}
            />
          </div>
        );
      })}

      <div className="ts-add-links">
        <textarea
          className="tj-input"
          rows={2}
          value={paste}
          placeholder={k.placeholder}
          onChange={(e) => {
            setPaste(e.target.value);
            setNote("");
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (splitLinks(text, k.clean).length) {
              e.preventDefault();
              add(text);
            }
          }}
        />
        <button type="button" className="tj-btn" onClick={() => add(paste)} disabled={!paste.trim()}>
          <FaPlus /> Add
        </button>
      </div>
      {note && <small className="tj-muted">{note}</small>}
    </div>
  );
}

// ---- Section editors shared by team and event pages ------------------------

export function TextEditor({ s, set }) {
  return (
    <>
      <Field label="Text" hint="Leave a blank line to start a new paragraph.">
        <textarea
          className="tj-input tj-choices"
          rows={7}
          value={s.text}
          onChange={(e) => set({ ...s, text: e.target.value })}
        />
      </Field>
      <div className="ts-grid-2">
        <Field label="Button label (optional)">
          <input className="tj-input" value={s.buttonLabel} onChange={(e) => set({ ...s, buttonLabel: e.target.value })} placeholder="மேலும் அறிய" />
        </Field>
        <Field label="Button link (optional)">
          <input className="tj-input" value={s.buttonUrl} onChange={(e) => set({ ...s, buttonUrl: e.target.value })} placeholder="https://…" />
        </Field>
      </div>
    </>
  );
}

export function TimelineEditor({ s, set }) {
  const setItems = (items) => set({ ...s, items });
  return (
    <div className="ts-items">
      {s.items.map((t, i) => (
        <div className="ts-timeline-row" key={t.id}>
          <input
            className="tj-input ts-year"
            value={t.year}
            onChange={(e) => setItems(setAt(s.items, i, { ...t, year: e.target.value }))}
            placeholder="2025"
          />
          <input
            className="tj-input"
            value={t.text}
            onChange={(e) => setItems(setAt(s.items, i, { ...t, text: e.target.value }))}
            placeholder="Milestone, e.g. First Thamilaruvi website launched"
          />
          <RowTools
            index={i}
            total={s.items.length}
            label="entry"
            onMove={(d) => setItems(move(s.items, i, d))}
            onRemove={() => setItems(removeAt(s.items, i))}
          />
        </div>
      ))}
      <button type="button" className="tj-btn tj-btn-ghost" onClick={() => setItems([...s.items, blankTimelineItem()])}>
        <FaPlus /> Add entry
      </button>
    </div>
  );
}

const STATUS_CHIP = {
  upcoming: { text: "Upcoming", cls: "is-up" },
  today: { text: "Today", cls: "is-today" },
  completed: { text: "Completed", cls: "is-done" },
  tba: { text: "No date", cls: "" },
};

export function CompetitionsEditor({ s, set }) {
  const [openId, setOpenId] = useState(s.items.length === 1 ? s.items[0].id : null);
  const setItems = (items) => set({ ...s, items });

  return (
    <div className="ts-items">
      {s.items.map((c, i) => {
        const put = (patch) => setItems(setAt(s.items, i, { ...c, ...patch }));
        const st = STATUS_CHIP[competitionStatus(c)];
        const open = openId === c.id;
        return (
          <div className={`ts-item${open ? " is-open" : ""}`} key={c.id}>
            <div className="ts-item-head">
              <button type="button" className="ts-item-toggle" onClick={() => setOpenId(open ? null : c.id)}>
                <strong>{c.name || "Untitled competition"}</strong>
                <span className={`tj-chip ts-status ${st.cls}`}>{st.text}</span>
                {c.date && <span className="tj-chip">{c.date}</span>}
                <FaChevronDown className="tj-field-caret" />
              </button>
              <RowTools
                index={i}
                total={s.items.length}
                label="competition"
                onMove={(d) => setItems(move(s.items, i, d))}
                onRemove={() => window.confirm(`Remove "${c.name || "this competition"}"?`) && setItems(removeAt(s.items, i))}
              />
            </div>
            {open && (
              <div className="ts-item-body">
                <Field label="Competition name">
                  <input className="tj-input" value={c.name} onChange={(e) => put({ name: e.target.value })} placeholder="சொற்கணை 2026" />
                </Field>
                <div className="ts-grid-2">
                  <Field label="Date" hint="Status and countdown update automatically from this.">
                    <input className="tj-input" type="date" value={c.date} onChange={(e) => put({ date: e.target.value })} />
                  </Field>
                  <Field label="Venue">
                    <input className="tj-input" value={c.venue} onChange={(e) => put({ venue: e.target.value })} placeholder="University of Moratuwa" />
                  </Field>
                </div>
                <ImageField label="Poster" value={c.poster} onChange={(v) => put({ poster: v })} />
                <Field label="Description">
                  <textarea className="tj-input tj-choices" rows={4} value={c.description} onChange={(e) => put({ description: e.target.value })} />
                </Field>
                <div className="ts-grid-2">
                  <Field label="Registration link" hint="Shown until the competition date passes.">
                    <input className="tj-input" value={c.registerUrl} onChange={(e) => put({ registerUrl: e.target.value })} placeholder="https://forms.gle/…" />
                  </Field>
                  <Field label="Recording link" hint="YouTube or any video link.">
                    <input className="tj-input" value={c.recordingUrl} onChange={(e) => put({ recordingUrl: e.target.value })} placeholder="https://youtu.be/…" />
                  </Field>
                </div>
                <Field label="Winners" hint="Shown once the competition is completed.">
                  <div className="ts-winners">
                    {["🥇", "🥈", "🥉"].map((medal, w) => (
                      <div className="ts-winner" key={medal}>
                        <span aria-hidden="true">{medal}</span>
                        <input
                          className="tj-input"
                          value={c.winners[w]}
                          onChange={(e) => put({ winners: setAt(c.winners, w, e.target.value) })}
                          placeholder={["1st place", "2nd place", "3rd place"][w]}
                        />
                      </div>
                    ))}
                  </div>
                </Field>
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className="tj-btn tj-btn-ghost"
        onClick={() => {
          const c = blankCompetition();
          setItems([...s.items, c]);
          setOpenId(c.id);
        }}
      >
        <FaPlus /> Add competition
      </button>
    </div>
  );
}

// ---- Section cards -------------------------------------------------------------------

// A collapsible card for one section. `meta` is the section type's
// { icon, label, hint, heading }; `renderBody` draws the type-specific editor.
export function SectionCard({ s, meta, count, index, total, open, onToggle, onChange, onDelete, onMove, renderBody }) {
  const Icon = meta.icon;
  // Once opened, the editor stays mounted while collapsed so an upload in
  // progress isn't cancelled by folding the section away.
  const opened = useRef(false);
  if (open) opened.current = true;

  return (
    <div className={`tj-field ts-section-card ts-type-${s.type}${open ? " is-open" : ""}${s.hidden ? " is-hidden" : ""}`}>
      <div className="tj-field-summary">
        <button type="button" className="tj-field-toggle" onClick={onToggle} aria-expanded={open}>
          <span className="tj-field-num ts-type-icon">
            <Icon />
          </span>
          <span className="tj-field-name">{s.title || meta.label}</span>
          <span className="tj-chip">{meta.label}</span>
          {count && <span className="tj-chip">{count}</span>}
          {s.hidden && <span className="tj-chip ts-chip-hidden">Hidden</span>}
          <FaChevronDown className="tj-field-caret" />
        </button>
        <div className="tj-field-tools">
          <button
            type="button"
            className="tj-tool"
            onClick={() => onChange({ ...s, hidden: !s.hidden })}
            title={s.hidden ? "Show on page" : "Hide from page"}
            aria-label={s.hidden ? "Show on page" : "Hide from page"}
          >
            {s.hidden ? <FaEyeSlash /> : <FaEye />}
          </button>
          <button type="button" className="tj-tool" onClick={() => onMove(-1)} disabled={index === 0} title="Move up" aria-label="Move up">
            <FaArrowUp />
          </button>
          <button type="button" className="tj-tool" onClick={() => onMove(1)} disabled={index === total - 1} title="Move down" aria-label="Move down">
            <FaArrowDown />
          </button>
          <button type="button" className="tj-tool tj-tool-del" onClick={onDelete} title="Delete section" aria-label="Delete section">
            <FaTrash />
          </button>
        </div>
      </div>

      {opened.current && (
        <div className="tj-field-body" style={open ? undefined : { display: "none" }}>
          <Field label="Section heading (shown on the page)" hint={meta.heading}>
            <input
              className="tj-input"
              value={s.title}
              onChange={(e) => onChange({ ...s, title: e.target.value })}
              placeholder={meta.label}
            />
          </Field>
          {renderBody()}
        </div>
      )}
    </div>
  );
}

// `types` in picker order, `meta` by type; `disabled` types (one-per-page
// sections already on the page) are shown greyed out.
export function SectionPicker({ types, meta, disabled = [], onPick, onClose }) {
  return (
    <div className="ts-picker">
      <div className="ts-picker-head">
        <strong>Add a section</strong>
        <button type="button" className="tj-tool" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
      </div>
      <div className="ts-picker-grid">
        {types.map((type) => {
          const m = meta[type];
          const Icon = m.icon;
          const off = disabled.includes(type);
          return (
            <button
              type="button"
              key={type}
              className={`ts-picker-tile ts-type-${type}`}
              onClick={() => onPick(type)}
              disabled={off}
              title={off ? "Already on this page" : undefined}
            >
              <span className="ts-picker-icon">
                <Icon />
              </span>
              <strong>{m.label}</strong>
              <small>{m.hint}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
