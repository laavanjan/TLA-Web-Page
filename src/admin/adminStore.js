// Client-side admin store (localStorage) — a "for now" stand-in until the Node
// backend is deployed. NOTE: this is NOT real security — credentials live in the
// browser and the gate can be bypassed via devtools. It only keeps the admin UI
// tidy and remembers the admin's choices on this device. Swap every function
// here for backend API calls when the server exists.
const CRED_KEY = "tla_admin_cred";
const SESSION_KEY = "tla_admin_session";
const STICKERS_KEY = "tla_enabled_stickers";

// Seeded default — change it on first login via the dashboard.
const DEFAULT_EMAIL = "admin@tlauom.com";
const DEFAULT_PASSWORD = "tla-admin";

async function sha256(text) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function readCred() {
  let cred = null;
  try {
    const raw = localStorage.getItem(CRED_KEY);
    if (raw) cred = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  if (!cred || !cred.email || !cred.hash) {
    cred = { email: DEFAULT_EMAIL, hash: await sha256(DEFAULT_PASSWORD) };
    try {
      localStorage.setItem(CRED_KEY, JSON.stringify(cred));
    } catch {
      /* ignore */
    }
  }
  return cred;
}

export async function getAdminEmail() {
  return (await readCred()).email;
}

export async function login(email, password) {
  const cred = await readCred();
  const hash = await sha256(password);
  const ok =
    String(email).trim().toLowerCase() === cred.email.toLowerCase() &&
    hash === cred.hash;
  if (ok) {
    try {
      localStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  }
  return ok;
}

export function isAuthed() {
  try {
    return localStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

// Change email and/or password. Requires the current password.
export async function updateCredentials({ currentPassword, newEmail, newPassword }) {
  const cred = await readCred();
  const curHash = await sha256(currentPassword || "");
  if (curHash !== cred.hash) {
    throw new Error("Current password is incorrect.");
  }
  const email = (newEmail || "").trim() || cred.email;
  const hash = newPassword ? await sha256(newPassword) : cred.hash;
  const next = { email, hash };
  localStorage.setItem(CRED_KEY, JSON.stringify(next));
  return next.email;
}

// --- Which stickers are shown in the editor -------------------------------
// Returns an array of enabled ids, or null meaning "all enabled" (default).
export function getEnabledStickerIds() {
  try {
    const raw = localStorage.getItem(STICKERS_KEY);
    if (!raw) return null;
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
}

export function setEnabledStickerIds(ids) {
  try {
    localStorage.setItem(STICKERS_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}
