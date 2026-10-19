// What visitors use and where they are: phone / computer / tablet as one
// split bar, the browsers, and the countries with their flags.
import React, { useMemo } from "react";
import { FaMobileAlt, FaDesktop, FaTabletAlt, FaGlobeAsia } from "react-icons/fa";

import TrafficCard, { EmptyNote } from "./TrafficCard";
import RankedBars from "./RankedBars";
import { ranked } from "../../admin/trafficMath";
import { COLORS, DEVICES, flag, countryName } from "../../admin/trafficLabels";

const DEVICE_ICONS = { mobile: FaMobileAlt, desktop: FaDesktop, tablet: FaTabletAlt };
const ORDER = ["mobile", "desktop", "tablet"];

function DeviceSplit({ devices }) {
  const total = ORDER.reduce((s, k) => s + (devices[k] || 0), 0);
  if (!total) return null;
  const parts = ORDER.filter((k) => devices[k]).map((k) => ({ k, n: devices[k], share: devices[k] / total }));
  return (
    <div className="tr-split">
      <div className="tr-split-bar" role="img" aria-label={parts.map((p) => `${DEVICES[p.k]} ${Math.round(p.share * 100)}%`).join(", ")}>
        {parts.map((p) => (
          <span key={p.k} style={{ flexGrow: p.share, background: COLORS.devices[p.k] }} title={`${DEVICES[p.k]}: ${p.n}`} />
        ))}
      </div>
      <ul className="tr-split-legend">
        {parts.map((p) => {
          const Icon = DEVICE_ICONS[p.k];
          return (
            <li key={p.k}>
              <i style={{ background: COLORS.devices[p.k] }} aria-hidden="true" />
              <Icon aria-hidden="true" />
              <span>{DEVICES[p.k]}</span>
              <b>{Math.round(p.share * 100)}%</b>
              <small>{p.n.toLocaleString("en-GB")}</small>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Audience({ now, index }) {
  const browsers = useMemo(() => ranked(now.browsers, 5, "Other").map(([key, value]) => ({ key, value, label: key })), [now.browsers]);
  const countries = useMemo(
    () => ranked(now.countries).map(([key, value]) => ({ key, value, label: countryName(key), lead: flag(key) })),
    [now.countries]
  );
  const browserTotal = browsers.reduce((s, b) => s + b.value, 0);
  const countryTotal = countries.reduce((s, c) => s + c.value, 0);
  const phones = now.devices.mobile || 0;
  const deviceTotal = ORDER.reduce((s, k) => s + (now.devices[k] || 0), 0);

  return (
    <>
      <TrafficCard
        icon={FaMobileAlt}
        title="Devices"
        hint={
          deviceTotal
            ? `${Math.round((phones / deviceTotal) * 100)}% of visitors use a phone, so check new pages on a phone first.`
            : "Phones, computers and tablets."
        }
        index={index}
      >
        {deviceTotal ? <DeviceSplit devices={now.devices} /> : <EmptyNote>No visits in this period yet.</EmptyNote>}
        {browsers.length > 0 && (
          <div className="tr-subsection">
            <h3>Browsers</h3>
            <RankedBars items={browsers} total={browserTotal} initial={6} color="#9085e9" />
          </div>
        )}
      </TrafficCard>
      <TrafficCard icon={FaGlobeAsia} title="Countries" hint="Where visitors are, from their internet connection." index={index + 1}>
        {countries.length ? (
          <RankedBars items={countries} total={countryTotal} initial={8} color="#199e70" />
        ) : (
          <EmptyNote>No visits in this period yet.</EmptyNote>
        )}
      </TrafficCard>
    </>
  );
}
