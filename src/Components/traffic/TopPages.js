// The most visited pages, with a switch to see only books, events or teams,
// so it's easy to tell which book is read most or which event drew a crowd.
import React, { useMemo, useState } from "react";
import { FaFileAlt } from "react-icons/fa";

import TrafficCard, { EmptyNote } from "./TrafficCard";
import RankedBars from "./RankedBars";
import { ranked } from "../../admin/trafficMath";
import { pageName, isBookPage } from "../../admin/trafficLabels";

const TABS = [
  { id: "all", label: "All pages", test: () => true, empty: "No page views in this period yet." },
  { id: "books", label: "Books", test: isBookPage, empty: "No books were opened in this period." },
  { id: "events", label: "Events", test: (p) => p.startsWith("/events/") || p === "/ideathon", empty: "No event pages were opened in this period." },
  { id: "teams", label: "Teams", test: (p) => /^\/teams\/(?!join$)[^/]+$/.test(p), empty: "No team pages were opened in this period." },
];

export default function TopPages({ now, index }) {
  const [tab, setTab] = useState("all");
  const current = TABS.find((t) => t.id === tab);

  const items = useMemo(
    () =>
      ranked(now.pages)
        .filter(([path]) => current.test(path))
        .map(([path, value]) => ({ key: path, value, label: pageName(path, now.titles[path]), sub: path })),
    [now.pages, now.titles, current]
  );
  const total = items.reduce((s, it) => s + it.value, 0);

  return (
    <TrafficCard
      icon={FaFileAlt}
      title="Most visited pages"
      hint="Page views per page: every time a page was opened."
      index={index}
    >
      <div className="tr-tabs" role="tablist" aria-label="Which pages">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === tab}
            className={t.id === tab ? "is-active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {items.length ? (
        <RankedBars key={tab} items={items} total={total} unit="views" initial={8} color="#3987e5" />
      ) : (
        <EmptyNote>{current.empty}</EmptyNote>
      )}
    </TrafficCard>
  );
}
