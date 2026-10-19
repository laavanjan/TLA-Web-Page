// "Download for Excel": the daily numbers for the chosen period, or the
// pages and how often each was opened. Saved as CSV with a byte-order mark so
// Excel shows Tamil page titles correctly.
import React, { useEffect, useRef, useState } from "react";
import { FaFileCsv, FaChevronDown } from "react-icons/fa";

import { dailyCsv, toCsv, ranked } from "../../admin/trafficMath";
import { pageName, sourceMeta } from "../../admin/trafficLabels";

function save(name, text) {
  const blob = new Blob(["﻿", text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CsvDownload({ rows, now, dates, disabled }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const span = dates.from === dates.to ? dates.from : `${dates.from}_to_${dates.to}`;

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const choices = [
    {
      label: "Daily numbers",
      hint: "Visitors, views and more for each day",
      run: () => save(`tla-traffic-daily_${span}.csv`, dailyCsv(rows, dates.from, dates.to)),
    },
    {
      label: "Pages",
      hint: "Every page and how often it was opened",
      run: () =>
        save(
          `tla-traffic-pages_${span}.csv`,
          toCsv(["Page", "Address", "Page views"], ranked(now.pages).map(([p, n]) => [pageName(p, now.titles[p]), p, n]))
        ),
    },
    {
      label: "Sources",
      hint: "Where visitors came from",
      run: () =>
        save(
          `tla-traffic-sources_${span}.csv`,
          toCsv(["Source", "Visitors"], ranked(now.sources).map(([k, n]) => [sourceMeta(k).label, n]))
        ),
    },
  ];

  return (
    <div className="tr-menu" ref={box}>
      <button
        type="button"
        className="tj-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <FaFileCsv /> Download for Excel <FaChevronDown className="tr-menu-caret" />
      </button>
      {open && (
        <ul className="tr-menu-list" role="menu">
          {choices.map((c) => (
            <li key={c.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  c.run();
                  setOpen(false);
                }}
              >
                <strong>{c.label}</strong>
                <small>{c.hint}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
