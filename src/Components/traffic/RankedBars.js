// A ranked list with a bar behind each row: the label on the left, the
// number and its share on the right. Used for sources, pages, countries and
// more. Every number is written out, so nothing depends on hovering.
import React, { useState } from "react";

export default function RankedBars({ items, total, unit = "visitors", initial = 6, color = "#c98500" }) {
  const [open, setOpen] = useState(false);
  const max = items.reduce((m, it) => Math.max(m, it.value), 0) || 1;
  const shown = open ? items : items.slice(0, initial);

  return (
    <>
      <ol className="tr-bars" style={{ "--bar": color }}>
        {shown.map((it, i) => {
          const Icon = it.icon;
          const share = total ? Math.round((it.value / total) * 100) : 0;
          return (
            <li key={it.key} title={`${it.label}: ${it.value.toLocaleString("en-GB")} ${unit}${total ? ` (${share}%)` : ""}`}>
              <span className="tr-bar-fill" style={{ "--w": `${(it.value / max) * 100}%`, "--d": `${i * 50}ms` }} aria-hidden="true" />
              <span className="tr-bar-label">
                {it.lead && <span className="tr-bar-lead">{it.lead}</span>}
                {Icon && <Icon className="tr-bar-icon" aria-hidden="true" />}
                <span className="tr-bar-text">
                  {it.label}
                  {it.sub && <small>{it.sub}</small>}
                </span>
              </span>
              <span className="tr-bar-value">
                <b>{it.value.toLocaleString("en-GB")}</b>
                {total > 0 && <small>{share}%</small>}
              </span>
            </li>
          );
        })}
      </ol>
      {items.length > initial && (
        <button type="button" className="tr-more" onClick={() => setOpen((v) => !v)}>
          {open ? "Show fewer" : `Show all ${items.length}`}
        </button>
      )}
    </>
  );
}
