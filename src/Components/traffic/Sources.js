// Where visitors came from: Google, Instagram, WhatsApp, a QR code, typing
// the address… Each visit counts once, for the place it started from.
import React, { useMemo } from "react";
import { FaRoute } from "react-icons/fa";

import TrafficCard, { EmptyNote } from "./TrafficCard";
import RankedBars from "./RankedBars";
import { ranked } from "../../admin/trafficMath";
import { sourceMeta } from "../../admin/trafficLabels";

export default function Sources({ now, index }) {
  const items = useMemo(
    () =>
      ranked(now.sources).map(([key, value]) => {
        const meta = sourceMeta(key);
        return { key, value, label: meta.label, icon: meta.icon, sub: meta.hint };
      }),
    [now.sources]
  );
  const total = items.reduce((s, it) => s + it.value, 0);
  const sites = useMemo(() => ranked(now.referrers, 8), [now.referrers]);

  return (
    <TrafficCard
      icon={FaRoute}
      title="Where visitors come from"
      hint="The app, website or link that brought each visitor to the site."
      index={index}
    >
      {items.length ? <RankedBars items={items} total={total} /> : <EmptyNote>No visits in this period yet.</EmptyNote>}
      {sites.length > 0 && (
        <div className="tr-subsection">
          <h3>Websites that linked to us</h3>
          <div className="tr-chips">
            {sites.map(([host, n]) => (
              <span key={host} className="tr-chip">
                {host} · {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </TrafficCard>
  );
}
