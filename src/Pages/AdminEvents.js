// /admin/events - edit the event pages (the 13 events and any new ones), the
// same way /admin/teams edits team pages: pick an event, change its sections,
// check the Preview tab, then Publish. Main admins also create events and
// arrange the home page cards; editors only see the events they're assigned.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaExternalLinkAlt,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaUndo,
  FaTrash,
  FaTimes,
  FaPen,
  FaThLarge,
  FaListUl,
  FaChevronDown,
} from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import EventDetail from "../Components/events/EventDetail";
import { EVENT_SECTION_META } from "../Components/events/eventSectionMeta";
import { SmartImage } from "../Components/teams/team-detail/media";
import { RESERVED_SLUGS, eventPath } from "../Components/events/eventsRegistry";
import {
  getCachedEventPages,
  fetchEventPages,
  saveEventPage,
  removeEventPage,
  saveLayout,
  cleanEventPage,
  eventPublicIds,
  groupsWithHidden,
  hiddenIds,
  eventTitle,
} from "../shared/eventPages";
import {
  EVENT_SECTION_TYPES,
  EVENT_CATEGORIES,
  SLUG_RE,
  blankSection,
  blankEventPage,
  slugify,
} from "../shared/eventSections";
import { missingFrom } from "../shared/teamPages";
import { deleteImages } from "../shared/cloudinaryUpload";
import { UploadContext } from "../shared/useImageUploads";
import { useAdminRole, canEditEvent } from "../admin/adminRole";
import { setAt, removeAt, move, ago, Field, ImageField, SectionCard, SectionPicker } from "../admin/editorKit";
import { EventSectionBody, eventCountLabel } from "../admin/eventEditors";
import "./Frame.css";
import "./Admin.css";
import "./AdminTeams.css";
import "./AdminEvents.css";

const normLayout = (l) => JSON.stringify({ order: l.order, hidden: hiddenIds(l) });

// The Publish button sits in the save bar, outside the form, so it also works from Preview.
const FORM_ID = "ev-editor-form";

// The "how it works" tip, until someone presses "Got it" in this browser.
const TIP_KEY = "tla_admin_events_tip_seen";

function useTipSeen() {
  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(TIP_KEY) === "1";
    } catch {
      return false;
    }
  });
  const dismiss = () => {
    setSeen(true);
    try {
      localStorage.setItem(TIP_KEY, "1");
    } catch {
      // Private mode: the tip just comes back next time.
    }
  };
  return [seen, dismiss];
}

// ---- Sidebar -----------------------------------------------------------------------------

// The status pill in the open event's heading.
function statusOf(p, dirty) {
  if (dirty) return { tone: "dirty", text: "Unpublished changes" };
  if (p.isNew) return { tone: "new", text: "New · not published yet" };
  if (p.updatedAt) return { tone: "ok", text: `Published · edited ${ago(p.updatedAt)}` };
  return { tone: "", text: p.builtIn ? "Built-in content" : "" };
}

// The small tag on an event row; built-in content that nobody has changed gets none.
function badgeOf(p, dirty) {
  if (dirty) return { tone: "dirty", text: "Unpublished", title: "Unpublished changes" };
  if (p.isNew) return { tone: "new", text: "New", title: "Not published yet" };
  if (p.updatedAt) return { tone: "ok", text: "Edited", title: `Published from here · edited ${ago(p.updatedAt)}` };
  return null;
}

// "/events/thaipongal" -> "/thaipongal": the readable part of the address.
const shortPath = (path) => path.replace(/^\/events(?=\/)/, "");

// `home` (main admins only): the "Home page cards" entry above the events.
// `hidden`: events left off the home page. On narrow screens the events fold
// away behind "All events" so the editor isn't pushed below a long list.
function EventList({ pages, activeId, dirtyId, hidden, canCreate, onPick, onNew, home }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [folded, setFolded] = useState([]); // collapsed groups
  const query = q.trim().toLowerCase();
  const match = (p) => !query || `${p.title} ${p.id}`.toLowerCase().includes(query);

  const item = (p, nested) => {
    const badge = badgeOf(p, p.id === dirtyId);
    const active = p.id === activeId;
    const offHome = !p.parent && hidden.includes(p.id);
    return (
      <li key={p.id}>
        <button
          type="button"
          className={`ev-item${active ? " is-active" : ""}${nested ? " is-nested" : ""}`}
          onClick={() => {
            setOpen(false);
            onPick(p.id);
          }}
          aria-current={active ? "page" : undefined}
        >
          <span className="ev-thumb">
            <SmartImage src={p.image} width={96} alt="" fallback={<b>{(p.title || "?").charAt(0)}</b>} />
          </span>
          <span className="ev-item-text">
            <span className="ev-item-title">{p.title || "Untitled"}</span>
            <span className="ev-item-meta">
              <code>{shortPath(p.path)}</code>
              {offHome && <FaEyeSlash className="ev-item-off" title="Not on the home page" aria-label="Not on the home page" />}
              {badge && (
                <span className={`ev-badge is-${badge.tone}`} title={badge.title}>
                  {badge.text}
                </span>
              )}
            </span>
          </span>
        </button>
      </li>
    );
  };

  // Sub-pages sit under their event. Someone assigned to a sub-page but not
  // to its event still gets it, as a top-level entry.
  const kids = (p) => pages.filter((k) => k.parent === p.id);
  const topLevel = pages.filter((p) => !p.parent || !pages.some((k) => k.id === p.parent));
  const groups = EVENT_CATEGORIES.map((c) => {
    const items = topLevel.filter((p) => p.category === c.id && (match(p) || kids(p).some(match)));
    const rows = items.flatMap((p) => [[p, false], ...kids(p).filter(match).map((k) => [k, true])]);
    return { category: c, rows };
  }).filter((g) => g.rows.length);

  const toggleGroup = (id) => setFolded((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <aside className={`ev-list${open ? " is-open" : ""}`} aria-label="Events">
      {home && (
        <button
          type="button"
          className={`ev-nav${home.active ? " is-active" : ""}`}
          onClick={home.onOpen}
          aria-current={home.active ? "page" : undefined}
        >
          <span className="ev-nav-icon">
            <FaThLarge />
          </span>
          <span className="ev-nav-text">
            <strong>Home page cards</strong>
            <small>Order and visibility</small>
          </span>
          {home.dirty && <span className="ts-dirty-dot" title="Unpublished changes" />}
        </button>
      )}

      <button type="button" className="ev-list-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <FaListUl /> All events
        <span className="ev-count">{pages.length}</span>
        <FaChevronDown className="tj-field-caret" />
      </button>

      <div className="ev-list-body">
        <div className="ev-list-head">
          <span className="ev-list-title">
            Events <span className="ev-count">{pages.length}</span>
          </span>
          {canCreate && (
            <button type="button" className="tj-btn ev-new-btn" onClick={onNew} title="Create a new event">
              <FaPlus /> New event
            </button>
          )}
        </div>

        <label className="ev-search">
          <FaSearch aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQ("")}
            placeholder="Find an event"
            aria-label="Find an event"
          />
          {q && (
            <button type="button" className="ev-search-clear" onClick={() => setQ("")} aria-label="Clear search">
              <FaTimes />
            </button>
          )}
        </label>

        <div className="ev-groups">
          {groups.map(({ category, rows }) => {
            // A search opens every group, so matches are never tucked away.
            const shut = !query && folded.includes(category.id);
            return (
              <div className={`ev-cat${shut ? " is-shut" : ""}`} key={category.id}>
                <button type="button" className="ev-cat-head" onClick={() => toggleGroup(category.id)} aria-expanded={!shut}>
                  <FaChevronDown className="ev-cat-caret" />
                  <span className="ev-cat-title">{category.title}</span>
                  <span className="ev-count">{rows.length}</span>
                </button>
                {!shut && <ul>{rows.map(([p, nested]) => item(p, nested))}</ul>}
              </div>
            );
          })}
          {!groups.length && <p className="tj-muted ev-none">No events match “{q.trim()}”.</p>}
        </div>
      </div>
    </aside>
  );
}

// ---- New event ---------------------------------------------------------------------------

// A small dialog over the page, so the form opens where you're looking
// instead of at the bottom of the event list.
function NewEventDialog({ pages, onCreate, onCancel }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="ev-modal tj" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="ev-dialog" role="dialog" aria-modal="true" aria-labelledby="ev-new-title">
        <NewEventForm pages={pages} onCreate={onCreate} onCancel={onCancel} />
      </div>
    </div>
  );
}

function NewEventForm({ pages, onCreate, onCancel }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [edited, setEdited] = useState(false);
  const [category, setCategory] = useState("culture");
  const address = edited ? slug : slugify(name);
  const taken = pages.some((p) => p.id === address) || RESERVED_SLUGS.includes(address);
  const valid = name.trim() && SLUG_RE.test(address) && !taken;

  return (
    <form
      className="ev-new"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onCreate({ name: name.trim(), slug: address, category });
      }}
    >
      <div className="ev-new-head">
        <div>
          <h3 className="tj-h3" id="ev-new-title">
            New event
          </h3>
          <p className="tj-muted">It starts with an introduction section. Nothing is public until you publish it.</p>
        </div>
        <button type="button" className="tj-tool" onClick={onCancel} aria-label="Cancel">
          <FaTimes />
        </button>
      </div>
      <Field label="Event name">
        <input className="tj-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="தமிழ் விழா 2026" />
      </Field>
      <Field label="Page address" hint="English letters, numbers and dashes. This becomes the link people share.">
        <div className="ev-address">
          <span>/events/</span>
          <input
            className="tj-input"
            value={address}
            onChange={(e) => {
              setEdited(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            }}
            placeholder="tamil-vizha-2026"
          />
        </div>
        {address && taken && <small className="tj-warn">That address is already used.</small>}
        {address && !taken && !SLUG_RE.test(address) && <small className="tj-warn">Use at least 2 letters or numbers.</small>}
      </Field>
      <Field label="Group on the home page">
        <select className="tj-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </Field>
      <div className="ae-form-actions">
        <button type="button" className="tj-btn tj-btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="frame-btn frame-btn-primary" disabled={!valid}>
          Create
        </button>
      </div>
    </form>
  );
}

// ---- Heading of the main area ------------------------------------------------------------

// What's open (an event, or the home page cards), its status, and on the
// right how to look at it.
function MainHead({ eyebrow, title, children, actions }) {
  return (
    <header className="ev-head">
      <div className="ev-head-main">
        <span className="ev-head-eyebrow">{eyebrow}</span>
        <h2 className="ev-head-title">{title}</h2>
        {children && <div className="ev-head-meta">{children}</div>}
      </div>
      {actions}
    </header>
  );
}

// ---- Home page cards ---------------------------------------------------------------------

function HomeCards({ pages, layout, setLayout, dirty, busy, msg, onSave, onDiscard, onEdit }) {
  const hidden = new Set(hiddenIds(layout));
  const groups = groupsWithHidden(pages, layout);

  const apply = (nextGroups, nextHidden = hidden) =>
    setLayout({ order: nextGroups.flatMap((g) => g.cards.map((c) => c.id)), hidden: [...nextHidden] });

  const shift = (catId, id, dir) =>
    apply(
      groups.map((g) => {
        if (g.category.id !== catId) return g;
        const i = g.cards.findIndex((c) => c.id === id);
        return { ...g, cards: move(g.cards, i, dir) };
      })
    );

  const toggle = (id) => {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    apply(groups, next);
  };

  return (
    <div className="tj-settings">
      <MainHead eyebrow="Home page" title="Home page cards">
        <span className={`ev-pill${dirty ? " is-dirty" : ""}`}>
          <i className="ev-dot" />
          {dirty ? "Unpublished changes" : "Published"}
        </span>
        <Link to="/" target="_blank" className="ev-head-link">
          Open the home page <FaExternalLinkAlt />
        </Link>
      </MainHead>

      <div className="ts-tip">
        <FaLightbulb />
        <span>
          These are the event cards on the home page, by group. Use the arrows to reorder a group and the eye to hide a
          card. Nothing changes on the site until you press <b>Publish</b>.
        </span>
      </div>

      {groups.map(({ category, cards }) =>
        cards.length ? (
          <section className="tj-section" key={category.id}>
            <header className="tj-section-head">
              <div>
                <h3 className="tj-h3">{category.title}</h3>
                <p className="tj-muted">
                  {cards.filter((c) => !hidden.has(c.id)).length} of {cards.length} shown
                </p>
              </div>
            </header>
            <ul className="ev-hc">
              {cards.map((c, i) => (
                <li key={c.id} className={hidden.has(c.id) ? "is-hidden" : ""}>
                  <span className="ev-hc-thumb">
                    <SmartImage src={c.image} width={160} alt="" fallback={<b>{c.title.charAt(0)}</b>} />
                  </span>
                  <span className="ev-hc-title">
                    <strong>{c.title}</strong>
                    {hidden.has(c.id) && <small>Not on the home page</small>}
                  </span>
                  <span className="ts-row-tools">
                    <button type="button" className="tj-tool" onClick={() => onEdit(c.id)} title="Edit this event" aria-label={`Edit ${c.title}`}>
                      <FaPen />
                    </button>
                    <button
                      type="button"
                      className="tj-tool"
                      onClick={() => toggle(c.id)}
                      title={hidden.has(c.id) ? "Show on the home page" : "Hide from the home page"}
                      aria-label={hidden.has(c.id) ? `Show ${c.title}` : `Hide ${c.title}`}
                    >
                      {hidden.has(c.id) ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button type="button" className="tj-tool" onClick={() => shift(category.id, c.id, -1)} disabled={i === 0} aria-label={`Move ${c.title} up`}>
                      <FaArrowUp />
                    </button>
                    <button type="button" className="tj-tool" onClick={() => shift(category.id, c.id, 1)} disabled={i === cards.length - 1} aria-label={`Move ${c.title} down`}>
                      <FaArrowDown />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null
      )}

      <div className={`tj-savebar${dirty ? " is-dirty" : ""}`}>
        <span className={`tj-savebar-msg${msg.type === "ok" ? " is-ok" : msg.type === "err" ? " is-err" : ""}`}>
          {msg.text || (dirty ? "You have unpublished changes to the home page" : "Everything is published")}
        </span>
        <span className="ts-savebar-actions">
          {dirty && (
            <button type="button" className="tj-btn tj-btn-ghost" onClick={onDiscard} disabled={busy}>
              Discard
            </button>
          )}
          <button type="button" className="frame-btn frame-btn-primary tj-save-btn" onClick={onSave} disabled={busy || !dirty}>
            {busy ? "Publishing…" : "Publish"}
          </button>
        </span>
      </div>
    </div>
  );
}

// ---- Page -------------------------------------------------------------------------------------

export default function AdminEvents() {
  const who = useAdminRole();
  const first = useMemo(() => getCachedEventPages().pages.find((p) => canEditEvent(who, p.id)), [who]);
  if (!first) {
    return (
      <div className="frame-page admin-page">
        <Helmet>
          <title>Event pages · Admin</title>
        </Helmet>
        <header className="frame-topbar">
          <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
          <LotusDivider />
          <span className="frame-subtitle">Admin · Event pages</span>
        </header>
        <div className="admin-hub tj">
          <Link to="/admin" className="tj-back">
            ← Dashboard
          </Link>
          <p className="tj-empty">You're not assigned to an event yet. Ask a main admin to add you to one.</p>
        </div>
      </div>
    );
  }
  return <EventStudio who={who} first={first} />;
}

function EventStudio({ who, first }) {
  const admin = who.role === "admin";
  const [snap, setSnap] = useState(() => getCachedEventPages());
  const [unsaved, setUnsaved] = useState([]); // events created here, not published yet
  const [activeId, setActiveId] = useState(first.id);
  const [draft, setDraft] = useState(first);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(first));
  const [view, setView] = useState("edit"); // edit | preview | home
  const [openKey, setOpenKey] = useState(null);
  const [picker, setPicker] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [layout, setLayout] = useState(() => snap.layout);
  const [layoutMsg, setLayoutMsg] = useState({ type: "", text: "" });
  const [layoutBusy, setLayoutBusy] = useState(false);
  const [tipSeen, dismissTip] = useTipSeen();
  const touched = useRef(false);
  const activeRef = useRef(activeId);
  const layoutTouched = useRef(false);

  const onBusy = useCallback((d) => setUploads((n) => Math.max(0, n + d)), []);
  const closeCreate = useCallback(() => setCreating(false), []);
  const uploadCtx = useMemo(() => ({ teamId: activeId, onBusy }), [activeId, onBusy]);

  const allPages = useMemo(
    () => [...snap.pages, ...unsaved.filter((u) => !snap.pages.some((p) => p.id === u.id))],
    [snap.pages, unsaved]
  );
  const visiblePages = useMemo(() => allPages.filter((p) => canEditEvent(who, p.id)), [allPages, who]);
  // The open event shows the name and group being typed, before they are published.
  const listPages = useMemo(
    () => visiblePages.map((p) => (p.id === activeId ? { ...p, title: draft.title, category: draft.category } : p)),
    [visiblePages, activeId, draft.title, draft.category]
  );
  const savedPage = snap.pages.find((p) => p.id === activeId) || unsaved.find((p) => p.id === activeId);

  useEffect(() => {
    fetchEventPages()
      .then((s) => {
        setSnap(s);
        if (!layoutTouched.current) setLayout(s.layout);
        if (!touched.current) {
          const cur = s.pages.find((x) => x.id === activeRef.current);
          if (cur) {
            setDraft(cur);
            setSavedJson(JSON.stringify(cur));
          }
        }
      })
      .catch(() => {});
  }, []);

  const dirty = JSON.stringify(draft) !== savedJson;
  const layoutDirty = normLayout(layout) !== normLayout(snap.layout);

  useEffect(() => {
    if (!dirty && !uploads && !layoutDirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploads, layoutDirty]);

  const update = (fn) => {
    touched.current = true;
    setMsg({ type: "", text: "" });
    setDraft(fn);
  };
  const setSection = (i, next) => update((d) => ({ ...d, sections: setAt(d.sections, i, next) }));
  // By id, from the latest state: uploads finish asynchronously, possibly
  // after the section was moved, and must never land in the wrong section.
  const updateSection = (id, fn) => update((d) => ({ ...d, sections: d.sections.map((x) => (x.id === id ? fn(x) : x)) }));
  const moveSection = (i, dir) => update((d) => ({ ...d, sections: move(d.sections, i, dir) }));
  const removeSection = (i) => {
    const s = draft.sections[i];
    if (!window.confirm(`Delete the "${s.title || EVENT_SECTION_META[s.type].label}" section?`)) return;
    update((d) => ({ ...d, sections: removeAt(d.sections, i) }));
  };
  const addSection = (type) => {
    const s = blankSection(type);
    update((d) => ({ ...d, sections: [...d.sections, s] }));
    setOpenKey(s.id);
    setPicker(false);
  };
  const setMeta = (patch) => update((d) => ({ ...d, ...patch }));

  // Photos uploaded into a draft that's being thrown away were never
  // published anywhere, so remove them from Cloudinary too.
  const dropUnpublishedUploads = (page, saved) => {
    const orphans = missingFrom(eventPublicIds(page), eventPublicIds(saved));
    if (orphans.length) deleteImages(orphans).catch(() => {});
  };

  const leaveDraft = () => {
    if (uploads && !window.confirm("Photos are still uploading for this event. Cancel the uploads and leave?")) return false;
    if (dirty && !window.confirm("You have unpublished changes for this event. Discard them?")) return false;
    if (dirty) dropUnpublishedUploads(draft, JSON.parse(savedJson));
    // An event created here and never published disappears when you leave it.
    if (draft.isNew) setUnsaved((u) => u.filter((x) => x.id !== draft.id));
    return true;
  };

  const open = (page) => {
    activeRef.current = page.id;
    touched.current = false;
    setActiveId(page.id);
    setDraft(page);
    setSavedJson(JSON.stringify(page));
    setOpenKey(null);
    setPicker(false);
    setCreating(false);
    setMsg({ type: "", text: "" });
  };

  const selectEvent = (id) => {
    if (id === activeId) {
      setView((v) => (v === "home" ? "edit" : v));
      return;
    }
    if (!leaveDraft()) return;
    setView((v) => (v === "home" ? "edit" : v));
    open(allPages.find((p) => p.id === id));
  };

  const discard = () => {
    if (!window.confirm("Discard all unpublished changes for this event?")) return;
    touched.current = false;
    dropUnpublishedUploads(draft, JSON.parse(savedJson));
    setDraft(JSON.parse(savedJson));
    setMsg({ type: "", text: "" });
  };

  const create = ({ name, slug, category }) => {
    if (!leaveDraft()) return;
    const page = {
      id: slug,
      builtIn: false,
      isNew: true,
      parent: null,
      path: eventPath(slug),
      updatedAt: null,
      ...blankEventPage(name, category),
    };
    setUnsaved((u) => [...u.filter((x) => x.id !== slug), page]);
    setView("edit");
    open(page);
    setOpenKey(page.sections[0].id);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (uploads > 0) return;
    if (!draft.title.trim()) {
      setMsg({ type: "err", text: "Give the event a name before publishing." });
      return;
    }
    setBusy(true);
    setMsg({ type: "", text: "" });
    try {
      const before = JSON.parse(savedJson);
      const saved = await saveEventPage(draft.id, draft);
      setSnap((s) => ({
        ...s,
        pages: s.pages.some((p) => p.id === saved.id) ? s.pages.map((p) => (p.id === saved.id ? saved : p)) : [...s.pages, saved],
      }));
      setUnsaved((u) => u.filter((x) => x.id !== saved.id));
      setDraft(saved);
      setSavedJson(JSON.stringify(saved));
      touched.current = false;
      let text = "Published - the event page is live with your changes.";
      // Uploaded photos the page no longer uses (removed, replaced, or in a
      // deleted section) are deleted from Cloudinary now that it's live.
      const unused = missingFrom(eventPublicIds(before), eventPublicIds(saved));
      if (unused.length) {
        const r = await deleteImages(unused);
        if (r.deleted.length) text += ` Removed ${r.deleted.length} unused photo${r.deleted.length === 1 ? "" : "s"} from Cloudinary.`;
        if (r.failed.length) text += ` (Couldn't remove ${r.failed.length} old photo${r.failed.length === 1 ? "" : "s"} - they're unused but still stored.)`;
      }
      setMsg({ type: "ok", text });
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Could not save." });
    } finally {
      setBusy(false);
    }
  };

  // Built-in events go back to their built-in content; events made here are deleted.
  const onRemove = async () => {
    if (!savedPage || savedPage.isNew) return;
    const custom = !savedPage.builtIn;
    const ok = window.confirm(
      custom
        ? `Delete "${savedPage.title}" completely? Its page address stops working and its photos are removed.`
        : `Go back to the built-in content of "${savedPage.title}"? Everything published for it here is removed.`
    );
    if (!ok) return;
    setBusy(true);
    setMsg({ type: "", text: "" });
    try {
      const gone = eventPublicIds(savedPage);
      const next = await removeEventPage(savedPage.id);
      if (gone.size) deleteImages([...gone]).catch(() => {});
      setSnap((s) => ({ ...s, pages: next.pages }));
      touched.current = false;
      if (custom) {
        const other = next.pages.find((p) => canEditEvent(who, p.id));
        open(other);
      } else {
        const back = next.pages.find((p) => p.id === savedPage.id);
        setDraft(back);
        setSavedJson(JSON.stringify(back));
        setMsg({ type: "ok", text: "Back to the built-in content." });
      }
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Could not remove it." });
    } finally {
      setBusy(false);
    }
  };

  const publishLayout = async () => {
    setLayoutBusy(true);
    setLayoutMsg({ type: "", text: "" });
    try {
      const next = await saveLayout({ order: layout.order, hidden: hiddenIds(layout) });
      setSnap((s) => ({ ...s, layout: next.layout, layoutUpdatedAt: next.layoutUpdatedAt }));
      setLayout(next.layout);
      layoutTouched.current = false;
      setLayoutMsg({ type: "ok", text: "Published - the home page cards are updated." });
    } catch (err) {
      setLayoutMsg({ type: "err", text: err.message || "Could not save." });
    } finally {
      setLayoutBusy(false);
    }
  };

  const changeLayout = (next) => {
    layoutTouched.current = true;
    setLayoutMsg({ type: "", text: "" });
    setLayout(next);
  };

  const category = EVENT_CATEGORIES.find((c) => c.id === draft.category);
  const onHome = !draft.parent && !hiddenIds(snap.layout).includes(draft.id);
  const canRemove = admin && savedPage && !savedPage.isNew && (!savedPage.builtIn || savedPage.updatedAt);
  const status = statusOf(savedPage || draft, dirty);
  const editing = view !== "home";

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Event pages · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Event pages</span>
      </header>

      {/* .tj (the admin look, with its font resets) goes on the editor pieces
          only, so the Preview keeps the site's own typography. */}
      <div className="admin-hub admin-hub-xwide ev-hub">
        <div className="tj tj-topnav">
          <Link to="/admin" className="tj-back">
            ← Dashboard
          </Link>
        </div>

        <div className="ev-shell">
          <div className="ev-side tj">
            <EventList
              pages={listPages}
              activeId={editing ? activeId : null}
              dirtyId={dirty ? activeId : null}
              hidden={hiddenIds(snap.layout)}
              canCreate={admin}
              onPick={selectEvent}
              onNew={() => setCreating(true)}
              home={admin ? { active: view === "home", dirty: layoutDirty, onOpen: () => setView("home") } : null}
            />
          </div>

          <div className="ev-main">
            <div className="tj ev-stack">
              {view === "home" && admin && (
                <HomeCards
                  pages={snap.pages}
                  layout={layout}
                  setLayout={changeLayout}
                  dirty={layoutDirty}
                  busy={layoutBusy}
                  msg={layoutMsg}
                  onSave={publishLayout}
                  onDiscard={() => {
                    layoutTouched.current = false;
                    setLayout(snap.layout);
                    setLayoutMsg({ type: "", text: "" });
                  }}
                  onEdit={(id) => {
                    selectEvent(id);
                    setView("edit");
                  }}
                />
              )}

              {editing && (
                <MainHead
                  eyebrow={draft.parent ? `Sub-page of ${eventTitle(allPages, draft.parent)}` : category ? category.title : "Event"}
                  title={draft.title || "Untitled event"}
                  actions={
                    <div className="tj-tabs ev-viewtabs" role="tablist" aria-label="View">
                      <button type="button" role="tab" aria-selected={view === "edit"} className={view === "edit" ? "is-active" : ""} onClick={() => setView("edit")}>
                        <FaPen /> Edit
                      </button>
                      <button type="button" role="tab" aria-selected={view === "preview"} className={view === "preview" ? "is-active" : ""} onClick={() => setView("preview")}>
                        <FaEye /> Preview
                        {dirty && <span className="ts-dirty-dot" title="Includes unpublished changes" />}
                      </button>
                    </div>
                  }
                >
                  <span
                    className={`ev-pill${status.tone ? ` is-${status.tone}` : ""}`}
                    title={status.tone ? undefined : "The page shows the content that comes with the site until you publish your own."}
                  >
                    <i className="ev-dot" />
                    {status.text}
                  </span>
                  {!draft.parent && !onHome && (
                    <span className="ev-pill is-off">
                      <FaEyeSlash /> Not on the home page
                    </span>
                  )}
                  {draft.isNew ? (
                    <code className="ev-head-path">{draft.path}</code>
                  ) : (
                    <Link to={draft.path} target="_blank" className="ev-head-link" title="Open the live page in a new tab">
                      <code className="ev-head-path">{draft.path}</code> <FaExternalLinkAlt />
                    </Link>
                  )}
                </MainHead>
              )}

              {/* Hidden rather than unmounted in Preview and Home page cards, so uploads keep going.
                  Keyed by event so in-flight uploads can never land in another event. */}
              <UploadContext.Provider value={uploadCtx}>
                <form
                  id={FORM_ID}
                  key={activeId}
                  className="tj-settings"
                  onSubmit={onSave}
                  style={view === "edit" ? undefined : { display: "none" }}
                >
                  {!tipSeen && (
                    <div className="ts-tip ev-tip">
                      <FaLightbulb />
                      <span>
                        <b>How it works:</b> the page is built from <b>sections</b>, top to bottom - click one to edit it,
                        or add, reorder and hide them. Under them is the event's <b>home page card</b>. Check{" "}
                        <b>Preview</b>, then <b>Publish</b>; the site doesn't change before that. <b>Photos:</b> click{" "}
                        <i>Upload</i> or drop them on a gallery - Google Drive and other https:// links work too.
                      </span>
                      <button type="button" className="tg-mini ev-tip-ok" onClick={dismissTip}>
                        Got it
                      </button>
                    </div>
                  )}

                  <section className="tj-section">
                    <header className="tj-section-head">
                      <div>
                        <h3 className="tj-h3">Page sections</h3>
                        <p className="tj-muted">
                          The page from top to bottom. Click a section to edit it; the eye hides it without deleting.
                        </p>
                      </div>
                      <button type="button" className="tj-btn" onClick={() => setPicker((v) => !v)} aria-expanded={picker}>
                        <FaPlus /> Add section
                      </button>
                    </header>

                    {picker && (
                      <SectionPicker
                        types={EVENT_SECTION_TYPES}
                        meta={EVENT_SECTION_META}
                        disabled={EVENT_SECTION_TYPES.filter((t) => EVENT_SECTION_META[t].once && draft.sections.some((s) => s.type === t))}
                        onPick={addSection}
                        onClose={() => setPicker(false)}
                      />
                    )}

                    {draft.sections.map((s, i) => (
                      <SectionCard
                        key={s.id}
                        s={s}
                        meta={EVENT_SECTION_META[s.type]}
                        count={eventCountLabel(s)}
                        index={i}
                        total={draft.sections.length}
                        open={openKey === s.id}
                        onToggle={() => setOpenKey((k) => (k === s.id ? null : s.id))}
                        onChange={(next) => setSection(i, next)}
                        onDelete={() => removeSection(i)}
                        onMove={(dir) => moveSection(i, dir)}
                        renderBody={() => (
                          <EventSectionBody s={s} set={(next) => setSection(i, next)} onUpdate={(fn) => updateSection(s.id, fn)} />
                        )}
                      />
                    ))}

                    {draft.sections.length === 0 && (
                      <p className="tj-empty">This page has no sections yet - use “Add section” to start.</p>
                    )}
                  </section>

                  <section className="tj-section">
                    <header className="tj-section-head">
                      <div>
                        <h3 className="tj-h3">{draft.parent ? "Page details" : "Home page card"}</h3>
                        <p className="tj-muted">
                          {draft.parent
                            ? "The name and a short description of this page. Sub-pages don't have a home page card."
                            : "The name, text and picture people see for this event on the home page."}
                        </p>
                      </div>
                    </header>
                    <div className={`ev-card-grid${draft.parent ? " is-single" : ""}`}>
                      <div className="ev-card-fields">
                        <Field label={draft.parent ? "Page name" : "Event name"}>
                          <input className="tj-input" value={draft.title} onChange={(e) => setMeta({ title: e.target.value })} />
                        </Field>
                        <Field
                          label={draft.parent ? "Short description" : "Card text"}
                          hint={
                            draft.parent
                              ? "Used as the page's description in search results."
                              : "Also the page's description in search results."
                          }
                        >
                          <textarea className="tj-input tj-choices" rows={4} value={draft.summary} onChange={(e) => setMeta({ summary: e.target.value })} />
                        </Field>
                        <div>
                          <ImageField label={draft.parent ? "Picture" : "Card illustration"} value={draft.image} onChange={(v) => setMeta({ image: v })} />
                          <small className="tj-muted ev-field-note">
                            Also the big picture in the introduction, unless that section has its own.
                          </small>
                        </div>
                        {admin && !draft.parent && (
                          <Field label="Group on the home page">
                            <select className="tj-input" value={draft.category} onChange={(e) => setMeta({ category: e.target.value })}>
                              {EVENT_CATEGORIES.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          </Field>
                        )}
                      </div>

                      {!draft.parent && (
                        <div className="ev-card-side">
                          <span className="tj-control-label">On the home page</span>
                          <div className={`ev-cardprev${onHome ? "" : " is-off"}`}>
                            <strong>{draft.title || "Event name"}</strong>
                            <div className="ev-cardprev-img">
                              <SmartImage src={draft.image} width={500} alt="" fallback={<span>No illustration</span>} />
                            </div>
                            <p>{draft.summary}</p>
                          </div>
                          <small className="tj-muted">
                            {onHome ? (
                              <>In “{category ? category.title : ""}”.</>
                            ) : admin ? (
                              <>
                                Hidden from the home page.{" "}
                                <button type="button" className="ts-link-btn ev-inline-link" onClick={() => setView("home")}>
                                  Change it in Home page cards
                                </button>
                              </>
                            ) : (
                              "Hidden from the home page."
                            )}
                          </small>
                        </div>
                      )}
                    </div>
                  </section>

                  {canRemove && (
                    <section className="tj-section ev-danger">
                      <div>
                        <h3 className="tj-h3">{savedPage.builtIn ? "Back to built-in" : "Delete event"}</h3>
                        <p className="tj-muted">
                          {savedPage.builtIn
                            ? "Throw away what was published here and show the content that comes with the site."
                            : "Removes the page, its address and its uploaded photos."}
                        </p>
                      </div>
                      <button type="button" className="tj-btn tj-btn-ghost ae-danger" onClick={onRemove} disabled={busy}>
                        {savedPage.builtIn ? (
                          <>
                            <FaUndo /> Revert to built-in content
                          </>
                        ) : (
                          <>
                            <FaTrash /> Delete this event
                          </>
                        )}
                      </button>
                    </section>
                  )}
                </form>
              </UploadContext.Provider>
            </div>

            {view === "preview" && (
              <div className="ts-preview ev-preview">
                <div className="ts-preview-bar">
                  <FaEye /> How <b>{draft.title || "this event"}</b> looks to visitors
                  {dirty ? " - including your unpublished changes" : ""}
                </div>
                <EventDetail page={cleanEventPage({ ...draft, sections: draft.sections })} preview />
              </div>
            )}

            {editing && (
              <div className={`tj tj-savebar${dirty ? " is-dirty" : ""}`}>
                <span className={`tj-savebar-msg${msg.type === "ok" ? " is-ok" : msg.type === "err" ? " is-err" : ""}`}>
                  {msg.text ||
                    (uploads > 0
                      ? "Uploading photos - Publish unlocks when they finish"
                      : draft.isNew
                      ? "Not published yet - Publish to create the event"
                      : dirty
                      ? "You have unpublished changes"
                      : "Everything is published")}
                </span>
                <span className="ts-savebar-actions">
                  {dirty && !draft.isNew && (
                    <button type="button" className="tj-btn tj-btn-ghost" onClick={discard} disabled={busy || uploads > 0}>
                      Discard
                    </button>
                  )}
                  <button
                    type="submit"
                    form={FORM_ID}
                    className="frame-btn frame-btn-primary tj-save-btn"
                    disabled={busy || (!dirty && !draft.isNew) || uploads > 0}
                  >
                    {busy ? "Publishing…" : uploads > 0 ? "Uploading…" : draft.isNew ? "Publish event" : "Publish"}
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {creating && <NewEventDialog pages={allPages} onCreate={create} onCancel={closeCreate} />}
    </div>
  );
}
