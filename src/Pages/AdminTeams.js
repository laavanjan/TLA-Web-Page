import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEyeSlash,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInstagram,
  FaImage,
  FaLightbulb,
  FaTimes,
} from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import TeamDetail from "../Components/teams/team-detail/TeamDetail";
import { SmartImage } from "../Components/teams/team-detail/media";
import { SECTION_META } from "../Components/teams/sectionMeta";
import {
  getCachedTeamPages,
  fetchTeamPages,
  saveTeamPage,
  blankSection,
  blankPerson,
  blankTimelineItem,
  blankCompetition,
  competitionStatus,
  cleanPage,
  SECTION_TYPES,
} from "../shared/teamPages";
import {
  youTubeId,
  youTubeThumb,
  instagramPost,
  imageSource,
  splitLinks,
} from "../shared/mediaLinks";
import "./Frame.css";
import "./Admin.css";
import "./AdminTeams.css";

const setAt = (arr, i, v) => arr.map((x, k) => (k === i ? v : x));
const removeAt = (arr, i) => arr.filter((_, k) => k !== i);
const move = (arr, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const a = [...arr];
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

function ago(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}

function RowTools({ index, total, onMove, onRemove, label }) {
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

function Field({ label, children, hint }) {
  return (
    <label className="tj-control">
      <span className="tj-control-label">{label}</span>
      {children}
      {hint && <small className="tj-muted">{hint}</small>}
    </label>
  );
}

// ---- Images ---------------------------------------------------------------

const SOURCE_LABEL = { drive: "Google Drive", cloudinary: "Cloudinary", web: "Web link" };

function ImageField({ label, value, onChange }) {
  const src = imageSource(value);
  const bad = value.trim() && !src;
  return (
    <div className="tj-control">
      {label && <span className="tj-control-label">{label}</span>}
      <div className="ts-image-field">
        <div className="ts-thumb">
          {src ? (
            <SmartImage
              src={value}
              width={400}
              alt=""
              fallback={
                <span className="ts-thumb-err" title="Couldn't load — for Drive, share as 'Anyone with the link'">
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
          <input
            className="tj-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste a Google Drive or Cloudinary image link"
          />
          {src && <span className={`ts-src ts-src-${src}`}>{SOURCE_LABEL[src]}</span>}
          {bad && <span className="tj-warn">Links must start with https://</span>}
        </div>
      </div>
    </div>
  );
}

// ---- Link lists (YouTube / Instagram / gallery) ---------------------------

const LINK_KINDS = {
  youtube: {
    check: youTubeId,
    noun: "video",
    bad: "Not a YouTube video link",
    placeholder: "Paste YouTube links — youtube.com/watch?v=…, youtu.be/…, /shorts/… (several at once is fine)",
  },
  instagram: {
    check: instagramPost,
    noun: "post",
    bad: "Not an Instagram post or reel link",
    placeholder: "Paste Instagram post or reel links — instagram.com/p/… or /reel/… (several at once is fine)",
  },
  gallery: {
    check: imageSource,
    noun: "photo",
    bad: "Must be an https:// image link",
    placeholder: "Paste Google Drive or Cloudinary image links (several at once is fine)",
  },
};

function LinkPreview({ kind, url }) {
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
  return { ok: true, text: SOURCE_LABEL[ok] };
}

function LinkList({ kind, links, onChange }) {
  const [paste, setPaste] = useState("");
  const [note, setNote] = useState("");
  const k = LINK_KINDS[kind];

  const add = (text) => {
    const found = splitLinks(text);
    if (!found.length) {
      setNote("No links found — they must start with https://");
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
            if (splitLinks(text).length) {
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

// ---- Section editors ------------------------------------------------------

function TextEditor({ s, set }) {
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

function PeopleEditor({ s, set }) {
  const setPeople = (people) => set({ ...s, people });
  return (
    <div className="ts-items">
      {s.people.map((p, i) => {
        const put = (patch) => setPeople(setAt(s.people, i, { ...p, ...patch }));
        return (
          <div className="ts-item" key={p.id}>
            <div className="ts-item-head">
              <strong>{p.name || `Person ${i + 1}`}</strong>
              <RowTools
                index={i}
                total={s.people.length}
                label="person"
                onMove={(d) => setPeople(move(s.people, i, d))}
                onRemove={() => setPeople(removeAt(s.people, i))}
              />
            </div>
            <div className="ts-grid-2">
              <Field label="Name">
                <input className="tj-input" value={p.name} onChange={(e) => put({ name: e.target.value })} />
              </Field>
              <Field label="Role">
                <input className="tj-input" value={p.role} onChange={(e) => put({ role: e.target.value })} placeholder="பிரதம ஒருங்கிணைப்பாளர்" />
              </Field>
              <Field label="Phone">
                <input className="tj-input" value={p.phone} onChange={(e) => put({ phone: e.target.value })} placeholder="07X XXX XXXX" />
              </Field>
              <Field label="LinkedIn">
                <input className="tj-input" value={p.linkedin} onChange={(e) => put({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/…" />
              </Field>
            </div>
            <ImageField label="Photo" value={p.photo} onChange={(v) => put({ photo: v })} />
          </div>
        );
      })}
      <button type="button" className="tj-btn tj-btn-ghost" onClick={() => setPeople([...s.people, blankPerson()])}>
        <FaPlus /> Add person
      </button>
    </div>
  );
}

function TimelineEditor({ s, set }) {
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
            placeholder="Name or milestone"
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

function MembersEditor({ s, set }) {
  const count = s.names.filter((n) => n.trim()).length;
  return (
    <Field label={`Members - one per line (${count})`}>
      <textarea
        className="tj-input tj-choices"
        rows={Math.min(14, Math.max(5, s.names.length + 1))}
        value={s.names.join("\n")}
        onChange={(e) => set({ ...s, names: e.target.value.split("\n") })}
      />
    </Field>
  );
}

const STATUS_CHIP = {
  upcoming: { text: "Upcoming", cls: "is-up" },
  today: { text: "Today", cls: "is-today" },
  completed: { text: "Completed", cls: "is-done" },
  tba: { text: "No date", cls: "" },
};

function CompetitionsEditor({ s, set }) {
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

function SectionBody({ s, set }) {
  switch (s.type) {
    case "text":
      return <TextEditor s={s} set={set} />;
    case "people":
      return <PeopleEditor s={s} set={set} />;
    case "timeline":
      return <TimelineEditor s={s} set={set} />;
    case "members":
      return <MembersEditor s={s} set={set} />;
    case "competitions":
      return <CompetitionsEditor s={s} set={set} />;
    case "gallery":
      return <LinkList kind="gallery" links={s.images} onChange={(images) => set({ ...s, images })} />;
    default:
      return <LinkList kind={s.type} links={s.links} onChange={(links) => set({ ...s, links })} />;
  }
}

function countLabel(s) {
  const n = (v, word) => `${v} ${word}${v === 1 ? "" : "s"}`;
  switch (s.type) {
    case "people":
      return n(s.people.length, "person").replace("persons", "people");
    case "timeline":
      return n(s.items.length, "entry").replace("entrys", "entries");
    case "members":
      return n(s.names.filter((x) => x.trim()).length, "member");
    case "youtube":
      return n(s.links.length, "video");
    case "instagram":
      return n(s.links.length, "post");
    case "competitions":
      return n(s.items.length, "competition");
    case "gallery":
      return n(s.images.length, "photo");
    default:
      return null;
  }
}

function SectionCard({ s, index, total, open, onToggle, onChange, onDelete, onMove }) {
  const meta = SECTION_META[s.type];
  const Icon = meta.icon;
  const count = countLabel(s);

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

      {open && (
        <div className="tj-field-body">
          <Field label="Section heading (shown on the page)">
            <input
              className="tj-input"
              value={s.title}
              onChange={(e) => onChange({ ...s, title: e.target.value })}
              placeholder={meta.label}
            />
          </Field>
          <SectionBody s={s} set={onChange} />
        </div>
      )}
    </div>
  );
}

function SectionPicker({ onPick, onClose }) {
  return (
    <div className="ts-picker">
      <div className="ts-picker-head">
        <strong>Add a section</strong>
        <button type="button" className="tj-tool" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
      </div>
      <div className="ts-picker-grid">
        {SECTION_TYPES.map((type) => {
          const m = SECTION_META[type];
          const Icon = m.icon;
          return (
            <button type="button" key={type} className={`ts-picker-tile ts-type-${type}`} onClick={() => onPick(type)}>
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

// ---- Page -----------------------------------------------------------------

export default function AdminTeams() {
  const [initial] = useState(getCachedTeamPages);
  const [pages, setPages] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0].id);
  const [draft, setDraft] = useState(initial[0]);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial[0]));
  const [view, setView] = useState("edit");
  const [openKey, setOpenKey] = useState(null);
  const [picker, setPicker] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const touched = useRef(false);
  const activeRef = useRef(activeId);

  useEffect(() => {
    fetchTeamPages()
      .then((p) => {
        setPages(p);
        if (!touched.current) {
          const cur = p.find((x) => x.id === activeRef.current) || p[0];
          setDraft(cur);
          setSavedJson(JSON.stringify(cur));
        }
      })
      .catch(() => {});
  }, []);

  const dirty = JSON.stringify(draft) !== savedJson;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (fn) => {
    touched.current = true;
    setMsg({ type: "", text: "" });
    setDraft(fn);
  };

  const setSection = (i, next) => update((d) => ({ ...d, sections: setAt(d.sections, i, next) }));
  const moveSection = (i, dir) => update((d) => ({ ...d, sections: move(d.sections, i, dir) }));
  const removeSection = (i) => {
    const s = draft.sections[i];
    if (!window.confirm(`Delete the "${s.title || SECTION_META[s.type].label}" section?`)) return;
    update((d) => ({ ...d, sections: removeAt(d.sections, i) }));
  };
  const addSection = (type) => {
    const s = blankSection(type);
    update((d) => ({ ...d, sections: [...d.sections, s] }));
    setOpenKey(s.id);
    setPicker(false);
  };

  const selectTeam = (id) => {
    if (id === activeId) return;
    if (dirty && !window.confirm("You have unpublished changes for this team. Discard them?")) return;
    const p = pages.find((x) => x.id === id);
    activeRef.current = id;
    touched.current = false;
    setActiveId(id);
    setDraft(p);
    setSavedJson(JSON.stringify(p));
    setOpenKey(null);
    setPicker(false);
    setMsg({ type: "", text: "" });
  };

  const discard = () => {
    if (!window.confirm("Discard all unpublished changes for this team?")) return;
    touched.current = false;
    setDraft(JSON.parse(savedJson));
    setMsg({ type: "", text: "" });
  };

  const onSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: "", text: "" });
    try {
      const saved = await saveTeamPage(draft.id, draft);
      setPages((ps) => ps.map((p) => (p.id === saved.id ? saved : p)));
      setDraft(saved);
      setSavedJson(JSON.stringify(saved));
      touched.current = false;
      setMsg({ type: "ok", text: "Published the team page is live with your changes." });
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Could not save." });
    } finally {
      setBusy(false);
    }
  };

  const setHeader = (patch) => update((d) => ({ ...d, ...patch }));

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Team pages · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Team pages</span>
      </header>

      <div className="admin-hub admin-hub-xwide tj">
        <div className="tj-topnav">
          <Link to="/admin" className="tj-back">
            ← Dashboard
          </Link>
          <div className="tj-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={view === "edit"} className={view === "edit" ? "is-active" : ""} onClick={() => setView("edit")}>
              Edit
            </button>
            <button type="button" role="tab" aria-selected={view === "preview"} className={view === "preview" ? "is-active" : ""} onClick={() => setView("preview")}>
              Preview{dirty ? " •" : ""}
            </button>
          </div>
        </div>

        <div className="ts-teams" role="tablist" aria-label="Teams">
          {pages.map((p) => {
            const active = p.id === activeId;
            const shown = active ? draft : p;
            const visible = shown.sections.filter((s) => !s.hidden).length;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={active}
                key={p.id}
                className={`ts-team${active ? " is-active" : ""}`}
                onClick={() => selectTeam(p.id)}
              >
                <span className="ts-team-title">
                  {shown.title}
                  {active && dirty && <span className="ts-dirty-dot" title="Unpublished changes" />}
                </span>
                <small>
                  {visible} section{visible === 1 ? "" : "s"} ·{" "}
                  {p.updatedAt ? `updated ${ago(p.updatedAt)}` : "default content"}
                </small>
              </button>
            );
          })}
        </div>

        {view === "edit" && (
          <form className="tj-settings" onSubmit={onSave}>
            <div className="ts-tip">
              <FaLightbulb />
              <span>
                <b>Images:</b> paste a Google Drive link (share it as <i>“Anyone with the link”</i>) or a
                Cloudinary image URL - Cloudinary images are resized and compressed automatically.{" "}
                <b>YouTube &amp; Instagram:</b> just paste the post/video links; you can paste several at once.
              </span>
            </div>

            <div className="tj-columns ts-columns">
              <section className="tj-section">
                <header className="tj-section-head">
                  <div>
                    <h3 className="tj-h3">Page sections</h3>
                    <p className="tj-muted">Click a section to edit it. Use the eye to hide it without deleting.</p>
                  </div>
                  <button type="button" className="tj-btn" onClick={() => setPicker((v) => !v)}>
                    <FaPlus /> Add section
                  </button>
                </header>

                {picker && <SectionPicker onPick={addSection} onClose={() => setPicker(false)} />}

                {draft.sections.map((s, i) => (
                  <SectionCard
                    key={s.id}
                    s={s}
                    index={i}
                    total={draft.sections.length}
                    open={openKey === s.id}
                    onToggle={() => setOpenKey((k) => (k === s.id ? null : s.id))}
                    onChange={(next) => setSection(i, next)}
                    onDelete={() => removeSection(i)}
                    onMove={(dir) => moveSection(i, dir)}
                  />
                ))}

                {draft.sections.length === 0 && (
                  <p className="tj-empty">This page has no sections yet — use “Add section” to start.</p>
                )}
              </section>

              <section className="tj-section ts-header-card">
                <header className="tj-section-head">
                  <div>
                    <h3 className="tj-h3">Page header</h3>
                    <p className="tj-muted">The banner at the top of the team page.</p>
                  </div>
                  <Link to={`/teams/${draft.id}`} target="_blank" className="tj-btn tj-btn-ghost">
                    <FaExternalLinkAlt /> Live page
                  </Link>
                </header>
                <Field label="Team name">
                  <input className="tj-input" value={draft.title} onChange={(e) => setHeader({ title: e.target.value })} />
                </Field>
                <Field label="Tagline">
                  <input className="tj-input" value={draft.tagline} onChange={(e) => setHeader({ tagline: e.target.value })} />
                </Field>
                <Field label="Card summary" hint="Shown on the team's card in the /teams list.">
                  <textarea
                    className="tj-input tj-choices"
                    rows={5}
                    value={draft.summary}
                    onChange={(e) => setHeader({ summary: e.target.value })}
                  />
                </Field>
                <ImageField label="Cover photo" value={draft.cover} onChange={(v) => setHeader({ cover: v })} />
              </section>
            </div>

            <div className={`tj-savebar${dirty ? " is-dirty" : ""}`}>
              <span className={`tj-savebar-msg${msg.type === "ok" ? " is-ok" : msg.type === "err" ? " is-err" : ""}`}>
                {msg.text || (dirty ? "You have unpublished changes" : "Everything is published")}
              </span>
              <span className="ts-savebar-actions">
                {dirty && (
                  <button type="button" className="tj-btn tj-btn-ghost" onClick={discard} disabled={busy}>
                    Discard
                  </button>
                )}
                <button type="submit" className="frame-btn frame-btn-primary tj-save-btn" disabled={busy || !dirty}>
                  {busy ? "Publishing…" : "Publish"}
                </button>
              </span>
            </div>
          </form>
        )}
      </div>

      {view === "preview" && (
        <div className="ts-preview">
          <div className="ts-preview-bar">
            <FaEye /> Preview of <b>{draft.title}</b>
            {dirty ? " — includes unpublished changes" : ""}
          </div>
          <TeamDetail page={cleanPage(draft)} preview />
        </div>
      )}
    </div>
  );
}
