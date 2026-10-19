// Where a visit came from, worked out in the browser from the referring page
// and any ?utm_source= tag on the link. Only the source name and the
// referring site's host are sent, never the full referring address.

// Hosts (or the end of them) → source. The first match wins.
const HOSTS = [
  ["google", ["google."]],
  ["bing", ["bing.com"]],
  ["duckduckgo", ["duckduckgo.com"]],
  ["yahoo", ["yahoo."]],
  ["instagram", ["instagram.com"]],
  ["facebook", ["facebook.com", "fb.com", "fb.me", "messenger.com"]],
  ["whatsapp", ["whatsapp.com", "whatsapp.net", "wa.me"]],
  ["tiktok", ["tiktok.com"]],
  ["youtube", ["youtube.com", "youtu.be"]],
  ["linkedin", ["linkedin.com", "lnkd.in"]],
  ["twitter", ["twitter.com", "x.com", "t.co"]],
  ["reddit", ["reddit.com"]],
  ["telegram", ["telegram.org", "t.me"]],
  ["chatgpt", ["chatgpt.com", "openai.com"]],
];

// utm_source values people actually type → the same names as above.
const ALIASES = {
  ig: "instagram",
  insta: "instagram",
  fb: "facebook",
  wa: "whatsapp",
  yt: "youtube",
  tt: "tiktok",
  x: "twitter",
  qr: "qr",
  "qr-code": "qr",
  qrcode: "qr",
  poster: "qr",
  email: "email",
  mail: "email",
  newsletter: "email",
};

export const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch (e) {
    return "";
  }
};

const matches = (host, ending) => host === ending || host.endsWith(`.${ending}`) || (ending.endsWith(".") && host.includes(ending));

export function sourceOfHost(host) {
  if (!host) return "direct";
  for (const [source, endings] of HOSTS) {
    if (endings.some((e) => matches(host, e))) return source;
  }
  return "other";
}

// referrer: document.referrer; search: location.search; ownHost: location.hostname
export function classifyVisit({ referrer = "", search = "", ownHost = "" } = {}) {
  const params = new URLSearchParams(search);
  const utm = {
    source: (params.get("utm_source") || "").trim().toLowerCase().slice(0, 60),
    medium: (params.get("utm_medium") || "").trim().toLowerCase().slice(0, 60),
    campaign: (params.get("utm_campaign") || "").trim().toLowerCase().slice(0, 80),
  };
  let referrerHost = hostOf(referrer);
  if (referrerHost && ownHost && referrerHost === ownHost.replace(/^www\./, "").toLowerCase()) referrerHost = "";

  return { source: utm.source ? sourceOfTag(utm.source) : sourceOfHost(referrerHost), referrerHost, utm };
}

// "ig" → instagram, "facebook.com" → facebook, "college-fair" → college-fair
function sourceOfTag(tag) {
  if (ALIASES[tag]) return ALIASES[tag];
  const known = sourceOfHost(tag.includes(".") ? tag : `${tag}.com`);
  if (known !== "other") return known;
  return tag.replace(/[^a-z0-9_-]/g, "").slice(0, 40) || "other";
}

// "/books/abc/" → "/books/abc"; query strings and #hashes never get stored.
export function cleanPath(pathname = "/") {
  const p = String(pathname || "/").split(/[?#]/)[0] || "/";
  const trimmed = p.length > 1 ? p.replace(/\/+$/, "") : p;
  return (trimmed || "/").slice(0, 200);
}
