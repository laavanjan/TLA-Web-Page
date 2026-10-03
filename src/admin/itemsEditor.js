// A list of repeated rows - agenda items, rules, sponsors, prizes, contacts,
// cards… - edited from a short description of its fields, so each of those
// sections doesn't need an editor written from scratch.
//
//   fields: [{ key, label, kind, placeholder, hint, rows, size, more }]
//     kind: "text" (default) | "textarea" | "date" | "image" | "photos"
//     size: "s" (narrow) | "m" | "l" (wide, default) - width of a compact row's box
//     more: tucked behind "More" in compact rows
//   compact: one line per item (lists of short entries). Otherwise each item
//            is a card that opens to show all its fields.
//
// `onUpdate` is the section's functional updater (it works from the latest
// state, which matters for photo uploads that finish after a move); it is only
// needed for "photos" fields.
import React, { useState } from "react";
import { FaPlus, FaChevronDown, FaEllipsisH } from "react-icons/fa";
import { Field, ImageField, RowTools, setAt, removeAt, move } from "./editorKit";
import GalleryEditor from "../Pages/AdminTeamsGallery";

function FieldBox({ f, item, put, onUpdate, inline }) {
  const value = item[f.key];
  switch (f.kind) {
    case "image":
      return <ImageField label={f.label} value={value} onChange={(v) => put({ [f.key]: v })} />;
    case "photos":
      return (
        <div className="tj-control">
          <span className="tj-control-label">{f.label}</span>
          <GalleryEditor
            s={{ images: value }}
            onUpdate={(fn) =>
              onUpdate((sec) => ({
                ...sec,
                items: sec.items.map((x) => (x.id === item.id ? { ...x, [f.key]: fn({ images: x[f.key] }).images } : x)),
              }))
            }
          />
        </div>
      );
    case "textarea": {
      const box = (
        <textarea
          className="tj-input tj-choices"
          rows={f.rows || 3}
          value={value}
          placeholder={f.placeholder}
          aria-label={f.label}
          onChange={(e) => put({ [f.key]: e.target.value })}
        />
      );
      return inline ? box : <Field label={f.label} hint={f.hint}>{box}</Field>;
    }
    default: {
      const box = (
        <input
          className="tj-input"
          type={f.kind === "date" ? "date" : "text"}
          value={value}
          placeholder={f.placeholder}
          aria-label={f.label}
          onChange={(e) => put({ [f.key]: e.target.value })}
        />
      );
      return inline ? box : <Field label={f.label} hint={f.hint}>{box}</Field>;
    }
  }
}

// Fields that sit side by side when they're short (size "s"/"m") in a card.
function cardFields(fields) {
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length) out.push({ pair: run });
    run = [];
  };
  fields.forEach((f) => {
    if (f.size === "m" || f.size === "s") {
      run.push(f);
      if (run.length === 2) flush();
    } else {
      flush();
      out.push({ one: f });
    }
  });
  flush();
  return out;
}

export function ItemsEditor({ items, onChange, onUpdate, blank, noun, fields, compact = false, titleOf, subtitleOf, hint }) {
  const [openId, setOpenId] = useState(null);
  const [moreId, setMoreId] = useState(null);
  const put = (i, patch) => onChange(setAt(items, i, { ...items[i], ...patch }));
  const add = () => {
    const b = blank();
    onChange([...items, b]);
    if (!compact) setOpenId(b.id);
  };

  const main = fields.filter((f) => !f.more);
  const extra = fields.filter((f) => f.more);

  return (
    <div className="ts-items">
      {hint && <p className="tj-muted">{hint}</p>}
      {items.map((it, i) => {
        if (compact) {
          const cols = main.map((f) => (f.size === "s" ? "100px" : f.size === "m" ? "minmax(0,1fr)" : "minmax(0,2fr)")).join(" ");
          const showMore = moreId === it.id;
          return (
            <div className="ev-row" key={it.id}>
              <div className="ev-row-main" style={{ "--cols": `${cols} auto` }}>
                {main.map((f) => (
                  <FieldBox key={f.key} f={f} item={it} put={(p) => put(i, p)} onUpdate={onUpdate} inline />
                ))}
                <div className="ev-row-tools">
                  {extra.length > 0 && (
                    <button
                      type="button"
                      className={`tj-tool${showMore ? " is-on" : ""}`}
                      onClick={() => setMoreId(showMore ? null : it.id)}
                      aria-label="More details"
                      title="More details"
                    >
                      <FaEllipsisH />
                    </button>
                  )}
                  <RowTools
                    index={i}
                    total={items.length}
                    label={noun}
                    onMove={(d) => onChange(move(items, i, d))}
                    onRemove={() => onChange(removeAt(items, i))}
                  />
                </div>
              </div>
              {showMore && (
                <div className="ev-row-more">
                  {extra.map((f) => (
                    <FieldBox key={f.key} f={f} item={it} put={(p) => put(i, p)} onUpdate={onUpdate} />
                  ))}
                </div>
              )}
            </div>
          );
        }

        const open = openId === it.id;
        const sub = subtitleOf && subtitleOf(it);
        return (
          <div className={`ts-item${open ? " is-open" : ""}`} key={it.id}>
            <div className="ts-item-head">
              <button type="button" className="ts-item-toggle" onClick={() => setOpenId(open ? null : it.id)}>
                <strong>{titleOf(it) || `New ${noun}`}</strong>
                {sub && <span className="tj-chip">{sub}</span>}
                <FaChevronDown className="tj-field-caret" />
              </button>
              <RowTools
                index={i}
                total={items.length}
                label={noun}
                onMove={(d) => onChange(move(items, i, d))}
                onRemove={() => window.confirm(`Remove "${titleOf(it) || `this ${noun}`}"?`) && onChange(removeAt(items, i))}
              />
            </div>
            {open && (
              <div className="ts-item-body">
                {cardFields(fields).map((g, k) =>
                  g.pair ? (
                    <div className="ts-grid-2" key={k}>
                      {g.pair.map((f) => (
                        <FieldBox key={f.key} f={f} item={it} put={(p) => put(i, p)} onUpdate={onUpdate} />
                      ))}
                    </div>
                  ) : (
                    <FieldBox key={g.one.key} f={g.one} item={it} put={(p) => put(i, p)} onUpdate={onUpdate} />
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="tj-btn tj-btn-ghost" onClick={add}>
        <FaPlus /> Add {noun}
      </button>
    </div>
  );
}
