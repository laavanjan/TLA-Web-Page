// /admin/faq - the questions in the "TLA உதவி" assistant (the உதவி button on
// every public page). Add, edit, hide, reorder and delete them, topic by
// topic. While editing, a preview shows the answer the way visitors get it,
// with {email}, {members} … filled in. Each question can also have English,
// shown when visitors switch the assistant to EN. Main admins only.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaPen,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaArrowRight,
  FaExternalLinkAlt,
  FaTimes,
} from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import {
  fetchFaqs,
  saveFaq,
  setFaqVisible,
  removeFaq,
  saveFaqOrder,
  normalizeFaq,
  newFaqId,
  fillTokens,
  unknownTokens,
  inLanguage,
  useFaqContext,
  FAQ_CATEGORIES,
  FAQ_TOKENS,
  POPULAR_IDS,
  NOT_FOUND_ID,
} from "../shared/faq/faqs";
import "./Frame.css";
import "./Admin.css";
import "./AdminMaintenance.css";
import "./AdminFaq.css";

const MAX_LINKS = 6;
const firstLine = (text) => String(text || "").split("\n")[0];
const norm = (s) => String(s || "").toLowerCase().normalize("NFC");

export default function AdminFaq() {
  const [rows, setRows] = useState(null); // null = loading; always in sort_order
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busyId, setBusyId] = useState(null); // a question id, or "order"
  const [editing, setEditing] = useState(null); // "new" | a question id
  const [filter, setFilter] = useState("");
  const nextOrder = useRef(0);
  const ctx = useFaqContext(true);

  useEffect(() => {
    fetchFaqs()
      .then((list) => {
        nextOrder.current = list.reduce((m, r) => Math.max(m, r.sort_order + 1), 0);
        setRows(list);
      })
      .catch(() => {
        setRows([]);
        setMsg({ type: "err", text: "Couldn't read the questions. Run supabase/migrations/faq.sql first if you haven't." });
      });
  }, []);

  const fail = (err) => setMsg({ type: "err", text: err.message || "Something went wrong." });

  // Every page address the questions already link to, offered while typing a link.
  const pages = useMemo(
    () => [...new Set((rows || []).flatMap((r) => r.links.filter((l) => l.to).map((l) => l.to)))].sort(),
    [rows]
  );

  const onSaved = (saved, wasNew) => {
    if (saved.sort_order >= nextOrder.current) nextOrder.current = saved.sort_order + 1;
    setRows((cur) => {
      const list = wasNew ? [...cur, saved] : cur.map((r) => (r.id === saved.id ? saved : r));
      return list.sort((a, b) => a.sort_order - b.sort_order);
    });
    setEditing(null);
    setMsg({
      type: "ok",
      text: saved.is_visible ? "Saved - live in the உதவி assistant." : "Saved. It is hidden from visitors.",
    });
  };

  const toggle = async (row) => {
    setBusyId(row.id);
    setMsg({ type: "", text: "" });
    try {
      await setFaqVisible(row.id, !row.is_visible);
      setRows((cur) => cur.map((r) => (r.id === row.id ? { ...r, is_visible: !row.is_visible } : r)));
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete this question for good?\n\n${row.q}\n\nTo keep it but stop showing it, use Hide instead.`)) return;
    setBusyId(row.id);
    setMsg({ type: "", text: "" });
    try {
      await removeFaq(row.id);
      setRows((cur) => cur.filter((r) => r.id !== row.id));
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  };

  // Swaps a question with the one above / below it in the same topic.
  const move = async (row, by) => {
    const same = rows.filter((r) => r.cat === row.cat);
    const other = same[same.indexOf(row) + by];
    if (!other) return;
    const before = rows;
    const order = [...rows];
    const i = order.indexOf(row);
    const j = order.indexOf(other);
    [order[i], order[j]] = [order[j], order[i]];
    setRows(order.map((r, k) => ({ ...r, sort_order: k })));
    setBusyId("order");
    setMsg({ type: "", text: "" });
    try {
      await saveFaqOrder(order); // compares against each row's saved sort_order
    } catch (err) {
      setRows(before);
      fail(err);
    } finally {
      setBusyId(null);
    }
  };

  const words = norm(filter).split(/\s+/).filter(Boolean);
  const matches = (r) => words.every((w) => norm(`${r.q} ${r.a} ${r.q_en} ${r.a_en} ${r.kw}`).includes(w));
  const groups = FAQ_CATEGORIES.map((c) => {
    const all = (rows || []).filter((r) => r.cat === c.id);
    return { ...c, all, shown: words.length ? all.filter(matches) : all };
  });
  const visibleCount = (rows || []).filter((r) => r.is_visible).length;
  const hiddenCount = (rows || []).length - visibleCount;
  const startEdit = (id) => {
    setEditing(id);
    setMsg({ type: "", text: "" });
  };

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Help assistant · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Help assistant</span>
      </header>

      <div className="admin-hub admin-hub-wide">
        <Link to="/admin" className="admin-back">
          ← Dashboard
        </Link>

        <div className="admin-card admin-books af">
          <div className="admin-info">
            <div className="admin-books-head">
              <h2 className="admin-title" style={{ textAlign: "left" }}>
                Help assistant questions
              </h2>
              {rows && (
                <span className={`admin-status ${visibleCount ? "is-open" : "is-closed"}`}>
                  ● {visibleCount} showing{hiddenCount ? ` · ${hiddenCount} hidden` : ""}
                </span>
              )}
            </div>
            <small className="am-hint">
              Visitors open the <strong>உதவி</strong> button on any page, pick a topic or search, and get these answers. Topics
              show their questions in this order. Changes are live as soon as you save.{" "}
              <a href="/" target="_blank" rel="noopener noreferrer">
                Open the site to try it <FaExternalLinkAlt />
              </a>
            </small>

            <div className="af-toolbar">
              <button
                type="button"
                className="frame-btn frame-btn-primary"
                onClick={() => startEdit("new")}
                disabled={rows === null || editing !== null}
              >
                <FaPlus /> Add question
              </button>
              <div className="af-search">
                <FaSearch aria-hidden="true" />
                <input
                  type="search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Find a question…"
                  aria-label="Find a question"
                />
              </div>
            </div>

            {editing === "new" && (
              <FaqEditor
                initial={null}
                ctx={ctx}
                pages={pages}
                nextOrder={nextOrder.current}
                onSaved={(f) => onSaved(f, true)}
                onCancel={() => setEditing(null)}
              />
            )}

            {msg.text && <div className={msg.type === "ok" ? "admin-ok" : "admin-error"}>{msg.text}</div>}

            {rows === null && <small className="am-hint">Loading…</small>}
            {words.length > 0 && rows && !groups.some((g) => g.shown.length) && (
              <small className="am-hint">No question matches "{filter}".</small>
            )}

            {groups
              .filter((g) => g.shown.length || (!words.length && rows && rows.length))
              .map((g) => (
                <section key={g.id} className="af-group">
                  <div className="af-group-head">
                    <span className="af-group-name">{g.label}</span>
                    <span className="af-count">{g.all.length}</span>
                  </div>
                  {!g.all.length && <small className="am-hint">No questions in this topic - it is left out of the assistant.</small>}
                  <ul className="af-list">
                    {g.shown.map((r) => {
                      const pos = g.all.indexOf(r);
                      const locked = r.id === NOT_FOUND_ID;
                      const busy = busyId === r.id || busyId === "order";
                      return (
                        <li key={r.id} className={`af-item ${r.is_visible ? "" : "is-hidden"} ${editing === r.id ? "is-editing" : ""}`}>
                          <span className="af-num">{pos + 1}</span>
                          <div className="af-body">
                            <span className="af-q">{r.q}</span>
                            <span className="af-a">{fillTokens(firstLine(r.a), ctx)}</span>
                            <span className="af-tags">
                              {!r.is_visible && <span className="af-tag is-off">Hidden</span>}
                              {inLanguage(r, "en").english ? (
                                <span className="af-tag is-en" title="Has an English version">
                                  EN
                                </span>
                              ) : (
                                <span className="af-tag is-muted" title="Shown in Tamil when visitors pick EN">
                                  No English
                                </span>
                              )}
                              {POPULAR_IDS.includes(r.id) && <span className="af-tag is-gold">In பிரபலமானவை</span>}
                              {locked && <span className="af-tag">Shown when a search finds nothing</span>}
                              {r.links.length > 0 && (
                                <span className="af-tag">
                                  {r.links.length} link{r.links.length === 1 ? "" : "s"}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="af-btns">
                            <button
                              type="button"
                              className="am-chip"
                              onClick={() => move(r, -1)}
                              disabled={pos === 0 || busy || words.length > 0}
                              aria-label="Move up"
                              title={words.length ? "Clear the search to reorder" : "Move up"}
                            >
                              <FaArrowUp />
                            </button>
                            <button
                              type="button"
                              className="am-chip"
                              onClick={() => move(r, 1)}
                              disabled={pos === g.all.length - 1 || busy || words.length > 0}
                              aria-label="Move down"
                              title={words.length ? "Clear the search to reorder" : "Move down"}
                            >
                              <FaArrowDown />
                            </button>
                            <button
                              type="button"
                              className="am-chip"
                              onClick={() => startEdit(editing === r.id ? null : r.id)}
                              disabled={busy || (editing !== null && editing !== r.id)}
                            >
                              <FaPen /> Edit
                            </button>
                            <button
                              type="button"
                              className="am-chip"
                              onClick={() => toggle(r)}
                              disabled={busy || locked || editing === r.id}
                              title={locked ? "This answer is needed when a search finds nothing" : undefined}
                            >
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
                            <button
                              type="button"
                              className="am-chip af-danger"
                              onClick={() => remove(r)}
                              disabled={busy || locked || editing === r.id}
                              title={locked ? "This answer is needed when a search finds nothing" : undefined}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                          {editing === r.id && (
                            <FaqEditor
                              initial={r}
                              ctx={ctx}
                              pages={pages}
                              nextOrder={nextOrder.current}
                              onSaved={(f) => onSaved(f, false)}
                              onCancel={() => setEditing(null)}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Add / edit form -------------------------------------------------------------------------

let linkSeq = 0;
// The form keeps each link as { kind: "to" | "href", target } so switching
// the kind doesn't lose what was typed.
const toRow = (l) => {
  linkSeq += 1;
  return { key: linkSeq, label: l.label, label_en: l.label_en || "", kind: l.href ? "href" : "to", target: l.to || l.href || "" };
};
const fromRow = (r) => {
  const label = { label: r.label, ...(r.label_en.trim() ? { label_en: r.label_en } : {}) };
  return r.kind === "to" ? { ...label, to: r.target } : { ...label, href: r.target };
};

const isHref = (t) => /^(https?:\/\/\S+|mailto:\S+|tel:\S+|\{\w+\})$/i.test(t.trim());

function linkError(r) {
  const label = r.label.trim();
  const target = r.target.trim();
  if (!label && !target) return "";
  if (!label) return "Give the link a label.";
  if (!target) return r.kind === "to" ? "Type the page address, e.g. /events/sotkanai." : "Type the web address.";
  if (r.kind === "to" && !target.startsWith("/")) return "A page of this site starts with / (e.g. /contact). For another website, choose Web link.";
  if (r.kind === "href" && !isHref(target)) return "A web link starts with https://, mailto: or tel: (or is a word like {facebookUrl}).";
  return "";
}

const EMPTY = { cat: FAQ_CATEGORIES[0].id, q: "", a: "", q_en: "", a_en: "", kw: "", links: [], is_visible: true };

// The form starts with the question's English - or, for a built-in question
// whose row has no English yet, the English the assistant already shows for it,
// so saving keeps it.
function startDraft(initial) {
  const f = normalizeFaq(initial || EMPTY);
  if (initial && !f.q_en && !f.a_en) {
    const en = inLanguage(f, "en");
    if (en.english) {
      f.q_en = en.q;
      f.a_en = en.a;
    }
    f.links = f.links.map((l, i) => (l.label_en || en.links[i].text === l.label ? l : { ...l, label_en: en.links[i].text }));
  }
  return { ...f, links: f.links.map(toRow) };
}

function FaqEditor({ initial, ctx, pages, nextOrder, onSaved, onCancel }) {
  const [draft, setDraft] = useState(() => startDraft(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const answerRef = useRef(null);
  const answerEnRef = useRef(null);
  // Which answer box the Insert buttons type into: the last one used.
  const tokenField = useRef("a");
  const locked = !!initial && initial.id === NOT_FOUND_ID;

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setLink = (key, patch) => setDraft((d) => ({ ...d, links: d.links.map((l) => (l.key === key ? { ...l, ...patch } : l)) }));
  const moveLink = (i, by) =>
    setDraft((d) => {
      const links = [...d.links];
      [links[i], links[i + by]] = [links[i + by], links[i]];
      return { ...d, links };
    });

  // Puts {token} where the cursor is in the answer box used last.
  const insertToken = (t) => {
    const field = tokenField.current;
    const el = field === "a_en" ? answerEnRef.current : answerRef.current;
    const value = draft[field];
    const text = `{${t}}`;
    const start = el ? el.selectionStart : value.length;
    const end = el ? el.selectionEnd : value.length;
    set({ [field]: value.slice(0, start) + text + value.slice(end) });
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const unknown = unknownTokens([draft.a, draft.a_en, ...draft.links.map((l) => `${l.label} ${l.label_en} ${l.target}`)].join(" "));

  const validate = () => {
    if (!draft.q.trim()) return "Type the question.";
    if (!draft.a.trim()) return "Type the answer.";
    if (!draft.q_en.trim() !== !draft.a_en.trim()) return "Fill in both the English question and answer, or leave both empty.";
    const bad = draft.links.map(linkError).find(Boolean);
    return bad || "";
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
    const body = { ...draft, id: initial ? initial.id : newFaqId(), links: draft.links.map(fromRow) };
    // New, or moved to another topic -> the end of its topic.
    const moved = !initial || initial.cat !== draft.cat;
    try {
      const saved = await saveFaq(body, { isNew: !initial, sortOrder: moved ? nextOrder : undefined });
      onSaved(saved);
    } catch (err) {
      setError(err.message || "Could not save the question.");
      setSaving(false);
    }
  };

  const formId = initial ? initial.id : "new";

  return (
    <form className="af-editor" onSubmit={save}>
      <div className="af-editor-title">{initial ? "Edit question" : "Add a question"}</div>

      <div className="af-editor-cols">
        <div className="af-form">
          <label className="af-field">
            <span className="admin-label">Topic</span>
            <select className="admin-input admin-field" value={draft.cat} onChange={(e) => set({ cat: e.target.value })}>
              {FAQ_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="af-field">
            <span className="admin-label">Question</span>
            <input
              className="admin-input admin-field"
              value={draft.q}
              maxLength={300}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="தமிழருவி எப்போது நடைபெறும்?"
            />
          </label>

          <div className="af-field">
            <label className="admin-label" htmlFor={`af-a-${formId}`}>
              Answer
            </label>
            <textarea
              id={`af-a-${formId}`}
              ref={answerRef}
              className="admin-input admin-field admin-textarea"
              rows={7}
              maxLength={3000}
              value={draft.a}
              onChange={(e) => set({ a: e.target.value })}
              onFocus={() => (tokenField.current = "a")}
              placeholder="Each new line shows as a new line. Start a line with • for a list."
            />
            <span className="af-tokens">
              <span>Insert:</span>
              {FAQ_TOKENS.map(([t, about]) => (
                <button
                  type="button"
                  key={t}
                  className="af-token"
                  onClick={() => insertToken(t)}
                  title={`${about} - now: ${ctx[t] || "(not set)"}`}
                >
                  {`{${t}}`}
                </button>
              ))}
            </span>
            <small className="am-hint">
              These words are swapped for the live value (see the preview), so the answer stays right when the contact details
              change.
            </small>
          </div>

          <fieldset className="af-en">
            <legend className="admin-label">English (optional)</legend>
            <small className="am-hint">
              Shown when visitors switch the assistant to EN. Leave both empty and they see the Tamil, with a note that the
              answer is only in Tamil for now.
            </small>
            <label className="af-field">
              <span className="admin-label">Question in English</span>
              <input
                className="admin-input admin-field"
                value={draft.q_en}
                maxLength={300}
                onChange={(e) => set({ q_en: e.target.value })}
                placeholder="When is Thamilaruvi held?"
                lang="en"
              />
            </label>
            <div className="af-field">
              <label className="admin-label" htmlFor={`af-aen-${formId}`}>
                Answer in English
              </label>
              <textarea
                id={`af-aen-${formId}`}
                ref={answerEnRef}
                className="admin-input admin-field admin-textarea"
                rows={6}
                maxLength={3000}
                value={draft.a_en}
                onChange={(e) => set({ a_en: e.target.value })}
                onFocus={() => (tokenField.current = "a_en")}
                placeholder="Same layout as the Tamil: new lines, • for a list, and the Insert words work here too."
                lang="en"
              />
            </div>
          </fieldset>

          <div className="af-field">
            <span className="admin-label">Links under the answer</span>
            {draft.links.map((l, i) => {
              const bad = linkError(l);
              return (
                <div key={l.key} className="af-link">
                  <div className="af-link-row">
                    <input
                      className="admin-input af-link-label"
                      value={l.label}
                      maxLength={80}
                      onChange={(e) => setLink(l.key, { label: e.target.value })}
                      placeholder="Label, e.g. சொற்கணை"
                      aria-label="Link label"
                    />
                    <input
                      className="admin-input af-link-label"
                      value={l.label_en}
                      maxLength={80}
                      onChange={(e) => setLink(l.key, { label_en: e.target.value })}
                      placeholder="English label, e.g. Sotkanai"
                      aria-label="Link label in English"
                      lang="en"
                    />
                    <select
                      className="admin-input af-link-kind"
                      value={l.kind}
                      onChange={(e) => setLink(l.key, { kind: e.target.value })}
                      aria-label="Link type"
                    >
                      <option value="to">Page of this site</option>
                      <option value="href">Web link</option>
                    </select>
                  </div>
                  <div className="af-link-row">
                    <input
                      className="admin-input af-link-target"
                      value={l.target}
                      maxLength={500}
                      list={l.kind === "to" ? "af-pages" : undefined}
                      onChange={(e) => setLink(l.key, { target: e.target.value })}
                      placeholder={l.kind === "to" ? "/events/sotkanai" : "https://…  or  mailto:{email}  or  {facebookUrl}"}
                      aria-label="Link address"
                    />
                    <button type="button" className="am-chip" onClick={() => moveLink(i, -1)} disabled={i === 0} aria-label="Move link up">
                      <FaArrowUp />
                    </button>
                    <button
                      type="button"
                      className="am-chip"
                      onClick={() => moveLink(i, 1)}
                      disabled={i === draft.links.length - 1}
                      aria-label="Move link down"
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      type="button"
                      className="am-chip af-danger"
                      onClick={() => set({ links: draft.links.filter((x) => x.key !== l.key) })}
                      aria-label="Remove link"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  {bad && <small className="am-hint af-warn">{bad}</small>}
                </div>
              );
            })}
            {draft.links.length < MAX_LINKS && (
              <button
                type="button"
                className="am-chip af-add-link"
                onClick={() => set({ links: [...draft.links, toRow({ label: "", label_en: "", to: "" })] })}
              >
                <FaPlus /> Add link
              </button>
            )}
            <datalist id="af-pages">
              {pages.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <label className="af-field">
            <span className="admin-label">Extra search words (optional)</span>
            <input
              className="admin-input admin-field"
              value={draft.kw}
              maxLength={300}
              onChange={(e) => set({ kw: e.target.value })}
              placeholder="English words and other spellings, e.g. thamilaruvi date venue"
            />
          </label>

          <label className="admin-check-row">
            <input
              type="checkbox"
              checked={draft.is_visible}
              disabled={locked}
              onChange={(e) => set({ is_visible: e.target.checked })}
            />
            Show to visitors
          </label>
          {locked && (
            <small className="am-hint">
              This is the answer visitors get when a search finds nothing, so it can be edited but not hidden or deleted.
            </small>
          )}
        </div>

        <FaqPreview draft={draft} ctx={ctx} unknown={unknown} />
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="af-editor-actions">
        <button type="submit" className="frame-btn frame-btn-primary" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add question"}
        </button>
        <button type="button" className="am-chip" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// The question and answer as a chat, the way the assistant shows them, in
// Tamil or English.
function FaqPreview({ draft, ctx, unknown }) {
  const [lang, setLang] = useState("ta");
  const links = draft.links.filter((l) => l.label.trim() && l.target.trim());
  const english = lang === "en" && !!(draft.q_en.trim() && draft.a_en.trim());
  const q = english ? draft.q_en.trim() : draft.q.trim();
  const a = english ? draft.a_en.trim() : draft.a.trim();
  return (
    <div className="af-preview">
      <div className="af-preview-head">
        <span className="admin-label">Preview - what visitors see</span>
        <span className="af-plang" role="group" aria-label="Preview language">
          <button type="button" className={lang === "ta" ? "is-on" : ""} aria-pressed={lang === "ta"} onClick={() => setLang("ta")}>
            த
          </button>
          <button type="button" className={lang === "en" ? "is-on" : ""} aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
        </span>
      </div>
      <div className="af-chat" lang={english ? "en" : "ta"}>
        <div className="af-msg is-user">
          <div className="af-bubble">{q || (lang === "en" ? "Question…" : "கேள்வி…")}</div>
        </div>
        <div className="af-msg is-bot">
          <div className="af-bubble">
            {lang === "en" && !english && <div className="af-pnote">This answer is only in Tamil for now.</div>}
            <div className="af-answer">{fillTokens(a, ctx) || (lang === "en" ? "Answer…" : "பதில்…")}</div>
            {links.length > 0 && (
              <div className="af-plinks">
                {links.map((l) => {
                  const label = fillTokens((lang === "en" && l.label_en.trim()) || l.label.trim(), ctx);
                  const href = l.kind === "to" ? l.target.trim() : fillTokens(l.target.trim(), ctx);
                  const ok = !linkError(l) && !/\{\w+\}/.test(href);
                  return (
                    <a
                      key={l.key}
                      className={`af-plink ${ok ? "" : "is-bad"}`}
                      href={ok ? href : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={ok ? `Opens ${href}` : "This link won't be shown until it's fixed"}
                    >
                      {label} {l.kind === "to" ? <FaArrowRight /> : <FaExternalLinkAlt />}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {unknown.length > 0 && (
        <small className="am-hint af-warn">
          {unknown.map((t) => `{${t}}`).join(", ")} {unknown.length === 1 ? "isn't a word" : "aren't words"} the site fills
          in, so visitors see {unknown.length === 1 ? "it" : "them"} as typed. Check the spelling, or use the Insert buttons.
        </small>
      )}
    </div>
  );
}
