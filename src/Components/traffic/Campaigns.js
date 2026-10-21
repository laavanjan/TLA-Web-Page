// Tagged links: which posters, QR codes and posts brought visitors, and a
// small builder to make such a link. A link like
//   tlauom.com/events/thamilaruvi?utm_source=instagram&utm_campaign=thamilaruvi-2026
// is counted under that campaign, so you can see what each post achieved.
import React, { useMemo, useState } from "react";
import { FaBullhorn, FaCopy, FaCheck } from "react-icons/fa";

import TrafficCard, { EmptyNote } from "./TrafficCard";
import { ranked } from "../../admin/trafficMath";
import { sourceMeta } from "../../admin/trafficLabels";

const CHANNELS = [
  ["instagram", "social", "Instagram post or story"],
  ["whatsapp", "chat", "WhatsApp message"],
  ["facebook", "social", "Facebook post"],
  ["tiktok", "social", "TikTok video"],
  ["qr", "print", "QR code on a poster"],
  ["email", "email", "Email"],
];

const slug = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

function LinkBuilder() {
  const [path, setPath] = useState("/");
  const [channel, setChannel] = useState("instagram");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const [source, medium] = CHANNELS.find((c) => c[0] === channel) || CHANNELS[0];
  const campaign = slug(name);
  const cleanPath = `/${path.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+/, "").split(/[?#]/)[0]}`;
  const params = new URLSearchParams({ utm_source: source, utm_medium: medium, ...(campaign ? { utm_campaign: campaign } : {}) });
  const link = `${window.location.origin}${cleanPath}?${params}`;

  const copy = () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, () => {});
  };

  return (
    <div className="tr-builder">
      <h3>Make a tagged link</h3>
      <div className="tr-builder-fields">
        <label>
          <span>Page</span>
          <input className="tj-input" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/events/thamilaruvi" />
        </label>
        <label>
          <span>Where it will be shared</span>
          <select className="tj-input" value={channel} onChange={(e) => setChannel(e.target.value)}>
            {CHANNELS.map(([id, , label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Campaign name</span>
          <input className="tj-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Thamilaruvi 2026" />
        </label>
      </div>
      <div className="tr-builder-out">
        <code title={link}>{link}</code>
        <button type="button" className="tj-btn" onClick={copy}>
          {copied ? <FaCheck /> : <FaCopy />} {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

export default function Campaigns({ now, index }) {
  const rows = useMemo(
    () =>
      ranked(now.campaigns).map(([key, n]) => {
        const [source, medium, campaign] = key.split("|");
        return { key, source, medium, campaign, n };
      }),
    [now.campaigns]
  );

  return (
    <TrafficCard
      icon={FaBullhorn}
      title="Posts, posters & QR codes"
      hint="Visitors who came through a tagged link. Make one below for each post or poster to see what it brought in."
      index={index}
    >
      {rows.length ? (
        <div className="tr-table-wrap">
          <table className="tr-table">
            <thead>
              <tr>
                <th scope="col">Campaign</th>
                <th scope="col">Shared on</th>
                <th scope="col" className="is-num">
                  Visitors
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const meta = sourceMeta(r.source);
                const Icon = meta.icon;
                return (
                  <tr key={r.key}>
                    <td>{r.campaign || <span className="tr-muted">(no name)</span>}</td>
                    <td>
                      <span className="tr-cell-icon">
                        <Icon aria-hidden="true" /> {meta.label}
                        {r.medium && <small>{r.medium}</small>}
                      </span>
                    </td>
                    <td className="is-num">{r.n.toLocaleString("en-GB")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyNote>No visits through tagged links in this period.</EmptyNote>
      )}
      <LinkBuilder />
    </TrafficCard>
  );
}
