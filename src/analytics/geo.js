// The visitor's country, as a two-letter code. Asked once per visit from
// /api/geo (Vercel knows the country from the request; no IP is stored).
// When that isn't available (local development, a slow network) the time
// zone gives a fair guess for the places most visitors come from.

const KEY = "tla_ac";

const ZONES = {
  "Asia/Colombo": "LK",
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Chennai": "IN",
  "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Dubai": "AE",
  "Asia/Qatar": "QA",
  "Asia/Riyadh": "SA",
  "Asia/Kuwait": "KW",
  "Asia/Muscat": "OM",
  "Asia/Tokyo": "JP",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
  "Europe/London": "GB",
  "Europe/Dublin": "IE",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Zurich": "CH",
  "Europe/Oslo": "NO",
  "Europe/Stockholm": "SE",
  "Europe/Copenhagen": "DK",
  "Europe/Amsterdam": "NL",
  "Europe/Rome": "IT",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
};

export function countryFromTimeZone(zone) {
  return ZONES[zone] || "";
}

const guess = () => {
  try {
    return countryFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch (e) {
    return "";
  }
};

let pending = null;

export function visitorCountry() {
  if (pending) return pending;
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved !== null) return (pending = Promise.resolve(saved));
  } catch (e) {
    // no storage: ask every time this tab loads, which is still once
  }
  const timeout = new Promise((resolve) => setTimeout(() => resolve(""), 1500));
  const asked = fetch("/api/geo", { cache: "no-store" })
    .then((r) => (r.ok && (r.headers.get("Content-Type") || "").includes("json") ? r.json() : {}))
    .then((d) => (/^[A-Z]{2}$/.test(d.country || "") ? d.country : ""))
    .catch(() => "");
  pending = Promise.race([asked, timeout]).then((code) => {
    const country = code || guess();
    try {
      sessionStorage.setItem(KEY, country);
    } catch (e) {
      // fine
    }
    return country;
  });
  return pending;
}
