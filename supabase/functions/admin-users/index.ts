// Manages admin panel accounts for /admin/editors: main admins and editors
// (people who may only edit the team pages and event pages they're assigned to).
// Creating logins and setting other people's passwords needs the
// service-role key, which only exists here, never in the browser.
//
// Every request carries the caller's Supabase access token
// (supabase.functions.invoke() attaches it). Body: { action, ...args }
//
//   Main admins only:
//     list                                   -> { users: [...] }
//     create   { name, email, password, role, teams, events }
//     update   { userId, name?, email?, role?, teams?, events? }
//     reset_password  { userId, password }
//     reveal_password { userId }             -> { password }   (logged)
//     set_disabled    { userId, disabled }
//     remove   { userId }
//   Any signed-in panel user:
//     change_own_password { currentPassword, newPassword }
//
// Team editors' passwords are also kept, encrypted (AES-GCM) with the
// PASSWORD_VAULT_KEY secret, so main admins can look them up.
//
// Secrets: PASSWORD_VAULT_KEY (any long random string). SUPABASE_URL,
// SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import { createClient } from "jsr:@supabase/supabase-js@2";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAULT_KEY = Deno.env.get("PASSWORD_VAULT_KEY") ?? "";

const TEAM_IDS = [1, 2, 3, 4]; // src/Components/teams/teamsData.js; teams made in /admin/teams are looked up in team_pages
// Event addresses: the built-in ones (src/Components/events/eventsRegistry.js)
// and any made in /admin/events, so only the shape is checked.
const EVENT_ID_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;
const MIN_PASSWORD = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const admin = createClient(URL_, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

// ---- Password vault ------------------------------------------------------------

const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function vaultKey() {
  if (!VAULT_KEY) throw new HttpError(500, "PASSWORD_VAULT_KEY isn't set on the server.");
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(VAULT_KEY));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function storePassword(userId: string, password: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await vaultKey(), new TextEncoder().encode(password));
  const { error } = await admin
    .from("admin_password_vault")
    .upsert({ user_id: userId, ciphertext: b64(ct), iv: b64(iv), updated_at: new Date().toISOString() });
  if (error) throw new HttpError(500, error.message);
}

async function readPassword(userId: string) {
  const { data, error } = await admin.from("admin_password_vault").select("ciphertext, iv").eq("user_id", userId).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) return null;
  try {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(data.iv) }, await vaultKey(), unb64(data.ciphertext));
    return new TextDecoder().decode(pt);
  } catch {
    throw new HttpError(500, "Couldn't decrypt - was PASSWORD_VAULT_KEY changed?");
  }
}

// ---- Helpers -------------------------------------------------------------------

type Me = { id: string; email: string; name: string; role: "admin" | "editor" };

async function caller(req: Request): Promise<Me> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "Not signed in.");
  const { data, error } = await createClient(URL_, ANON).auth.getUser(token);
  if (error || !data?.user) throw new HttpError(401, "Not signed in.");
  const { data: row } = await admin.from("admin_users").select("role, name, email, disabled").eq("user_id", data.user.id).maybeSingle();
  if (!row || row.disabled) throw new HttpError(403, "This account doesn't have admin panel access.");
  return { id: data.user.id, email: data.user.email ?? row.email, name: row.name, role: row.role };
}

function requireMainAdmin(me: Me) {
  if (me.role !== "admin") throw new HttpError(403, "Only main admins can manage accounts.");
}

async function log(me: Me, action: string, target: { id?: string; email?: string } = {}, details: Record<string, unknown> = {}, teamId: number | null = null) {
  await admin.from("admin_activity").insert({
    actor_id: me.id,
    actor_email: me.email,
    actor_name: me.name,
    action,
    target_id: target.id ?? null,
    target_email: target.email ?? "",
    team_id: teamId,
    details,
  });
}

async function cleanTeams(teams: unknown) {
  const asked = [...new Set((Array.isArray(teams) ? teams : []).map(Number).filter((t) => Number.isInteger(t) && t >= 1 && t <= 999))];
  const others = asked.filter((t) => !TEAM_IDS.includes(t));
  let made: number[] = [];
  if (others.length) {
    const { data } = await admin.from("team_pages").select("id").in("id", others);
    made = (data ?? []).map((r: { id: number }) => r.id);
  }
  return asked.filter((t) => TEAM_IDS.includes(t) || made.includes(t)).sort((a, b) => a - b);
}

const cleanEvents = (events: unknown) =>
  [...new Set((Array.isArray(events) ? events : []).filter((e): e is string => typeof e === "string" && EVENT_ID_RE.test(e)))].sort();

function checkPassword(p: unknown) {
  if (typeof p !== "string" || p.length < MIN_PASSWORD) {
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD} characters.`);
  }
  return p;
}

async function getTarget(userId: unknown) {
  if (typeof userId !== "string") throw new HttpError(400, "Missing user.");
  const { data, error } = await admin.from("admin_users").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "No such account.");
  return data;
}

async function adminCount() {
  const { count } = await admin.from("admin_users").select("user_id", { count: "exact", head: true }).eq("role", "admin").eq("disabled", false);
  return count ?? 0;
}

async function setTeams(userId: string, teams: number[]) {
  await admin.from("admin_user_teams").delete().eq("user_id", userId);
  if (teams.length) {
    const { error } = await admin.from("admin_user_teams").insert(teams.map((team_id) => ({ user_id: userId, team_id })));
    if (error) throw new HttpError(500, error.message);
  }
}

async function setEvents(userId: string, events: string[]) {
  const { error: delErr } = await admin.from("admin_user_events").delete().eq("user_id", userId);
  // event_pages.sql not run yet: nothing to clear, and nothing can be assigned.
  if (delErr) {
    if (events.length) throw new HttpError(500, "Run supabase/migrations/event_pages.sql first - events can't be assigned yet.");
    return;
  }
  if (events.length) {
    const { error } = await admin.from("admin_user_events").insert(events.map((event_id) => ({ user_id: userId, event_id })));
    if (error) throw new HttpError(500, error.message);
  }
}

// ---- Actions -------------------------------------------------------------------

async function list() {
  const [{ data: rows, error }, { data: teams }, { data: events }, { data: authData }, { data: vault }] = await Promise.all([
    admin.from("admin_users").select("*").order("created_at"),
    admin.from("admin_user_teams").select("user_id, team_id"),
    admin.from("admin_user_events").select("user_id, event_id"), // null until event_pages.sql is run

    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from("admin_password_vault").select("user_id"),
  ]);
  if (error) throw new HttpError(500, error.message);
  const authById = new Map((authData?.users ?? []).map((u) => [u.id, u]));
  const stored = new Set((vault ?? []).map((v) => v.user_id));
  return {
    users: (rows ?? []).map((r) => {
      const u = authById.get(r.user_id);
      return {
        userId: r.user_id,
        name: r.name,
        email: u?.email ?? r.email,
        role: r.role,
        disabled: r.disabled,
        teams: (teams ?? []).filter((t) => t.user_id === r.user_id).map((t) => t.team_id).sort(),
        events: (events ?? []).filter((e) => e.user_id === r.user_id).map((e) => e.event_id).sort(),
        createdAt: r.created_at,
        lastSignInAt: u?.last_sign_in_at ?? null,
        passwordChangedAt: r.password_changed_at,
        passwordStored: stored.has(r.user_id),
      };
    }),
  };
}

async function create(me: Me, b: Record<string, unknown>) {
  const name = String(b.name ?? "").trim().slice(0, 120);
  const email = String(b.email ?? "").trim().toLowerCase();
  const role = b.role === "admin" ? "admin" : "editor";
  const teams = role === "editor" ? await cleanTeams(b.teams) : [];
  const events = role === "editor" ? cleanEvents(b.events) : [];
  const password = checkPassword(b.password);
  if (!name) throw new HttpError(400, "Enter a name.");
  if (!EMAIL_RE.test(email)) throw new HttpError(400, "Enter a valid email.");
  if (role === "editor" && !teams.length && !events.length) throw new HttpError(400, "Pick at least one team or event.");

  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
  if (error || !data.user) throw new HttpError(400, error?.message ?? "Couldn't create the account.");
  const userId = data.user.id;
  const now = new Date().toISOString();
  const { error: rowErr } = await admin.from("admin_users").insert({ user_id: userId, role, name, email, password_changed_at: now });
  if (rowErr) {
    await admin.auth.admin.deleteUser(userId);
    throw new HttpError(500, rowErr.message);
  }
  await setTeams(userId, teams);
  await setEvents(userId, events);
  if (role === "editor") await storePassword(userId, password);
  await log(me, "account_created", { id: userId, email }, { name, role, teams, events });
  return { userId };
}

async function update(me: Me, b: Record<string, unknown>) {
  const t = await getTarget(b.userId);
  const patch: Record<string, unknown> = {};
  const changes: Record<string, unknown> = {};

  if (typeof b.name === "string" && b.name.trim() && b.name.trim() !== t.name) {
    patch.name = b.name.trim().slice(0, 120);
    changes.name = { from: t.name, to: patch.name };
  }
  if (typeof b.email === "string" && b.email.trim().toLowerCase() !== t.email) {
    const email = b.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw new HttpError(400, "Enter a valid email.");
    const { error } = await admin.auth.admin.updateUserById(t.user_id, { email, email_confirm: true });
    if (error) throw new HttpError(400, error.message);
    patch.email = email;
    changes.email = { from: t.email, to: email };
  }
  const role = b.role === "admin" || b.role === "editor" ? b.role : t.role;
  if (role !== t.role) {
    if (t.user_id === me.id) throw new HttpError(400, "You can't change your own role.");
    if (t.role === "admin" && (await adminCount()) <= 1) throw new HttpError(400, "There must be at least one main admin.");
    patch.role = role;
    changes.role = { from: t.role, to: role };
  }
  if (Object.keys(patch).length) {
    const { error } = await admin.from("admin_users").update(patch).eq("user_id", t.user_id);
    if (error) throw new HttpError(500, error.message);
  }

  if (role === "editor" && (b.teams !== undefined || b.events !== undefined)) {
    const { data: curTeams } = await admin.from("admin_user_teams").select("team_id").eq("user_id", t.user_id);
    const { data: curEvents } = await admin.from("admin_user_events").select("event_id").eq("user_id", t.user_id);
    const teamsBefore = (curTeams ?? []).map((x) => x.team_id).sort();
    const eventsBefore = (curEvents ?? []).map((x) => x.event_id).sort();
    const teamsAfter = b.teams !== undefined ? await cleanTeams(b.teams) : teamsBefore;
    const eventsAfter = b.events !== undefined ? cleanEvents(b.events) : eventsBefore;
    if (!teamsAfter.length && !eventsAfter.length) throw new HttpError(400, "Pick at least one team or event.");
    if (teamsBefore.join() !== teamsAfter.join()) {
      await setTeams(t.user_id, teamsAfter);
      changes.teams = { from: teamsBefore, to: teamsAfter };
    }
    if (eventsBefore.join() !== eventsAfter.join()) {
      await setEvents(t.user_id, eventsAfter);
      changes.events = { from: eventsBefore, to: eventsAfter };
    }
  } else if (role === "admin") {
    await setTeams(t.user_id, []);
    await setEvents(t.user_id, []);
  }

  if (Object.keys(changes).length) await log(me, "account_updated", { id: t.user_id, email: patch.email as string ?? t.email }, changes);
  return { ok: true };
}

async function resetPassword(me: Me, b: Record<string, unknown>) {
  const t = await getTarget(b.userId);
  const password = checkPassword(b.password);
  const { error } = await admin.auth.admin.updateUserById(t.user_id, { password });
  if (error) throw new HttpError(400, error.message);
  await admin.from("admin_users").update({ password_changed_at: new Date().toISOString() }).eq("user_id", t.user_id);
  if (t.role === "editor") await storePassword(t.user_id, password);
  await log(me, "password_reset", { id: t.user_id, email: t.email });
  return { ok: true };
}

async function revealPassword(me: Me, b: Record<string, unknown>) {
  const t = await getTarget(b.userId);
  if (t.role !== "editor") throw new HttpError(400, "Passwords are only kept for team editors.");
  const password = await readPassword(t.user_id);
  if (password === null) throw new HttpError(404, "No password stored for this account yet - reset it to set one.");
  await log(me, "password_viewed", { id: t.user_id, email: t.email });
  return { password };
}

async function setDisabled(me: Me, b: Record<string, unknown>) {
  const t = await getTarget(b.userId);
  const disabled = !!b.disabled;
  if (t.user_id === me.id) throw new HttpError(400, "You can't disable your own account.");
  if (disabled && t.role === "admin" && (await adminCount()) <= 1) throw new HttpError(400, "There must be at least one main admin.");
  // A ban stops them signing in or refreshing their session; the database
  // rules also check `disabled`, so any session they still hold can't write.
  const { error } = await admin.auth.admin.updateUserById(t.user_id, { ban_duration: disabled ? "876000h" : "none" });
  if (error) throw new HttpError(400, error.message);
  await admin.from("admin_users").update({ disabled }).eq("user_id", t.user_id);
  await log(me, disabled ? "account_disabled" : "account_enabled", { id: t.user_id, email: t.email });
  return { ok: true };
}

async function remove(me: Me, b: Record<string, unknown>) {
  const t = await getTarget(b.userId);
  if (t.user_id === me.id) throw new HttpError(400, "You can't remove your own account.");
  if (t.role === "admin" && !t.disabled && (await adminCount()) <= 1) throw new HttpError(400, "There must be at least one main admin.");
  const { error } = await admin.auth.admin.deleteUser(t.user_id); // cascades to roles, teams, vault
  if (error) throw new HttpError(400, error.message);
  await log(me, "account_removed", { id: t.user_id, email: t.email }, { name: t.name, role: t.role });
  return { ok: true };
}

async function changeOwnPassword(me: Me, b: Record<string, unknown>) {
  const newPassword = checkPassword(b.newPassword);
  const check = await createClient(URL_, ANON, { auth: { persistSession: false } }).auth.signInWithPassword({
    email: me.email,
    password: String(b.currentPassword ?? ""),
  });
  if (check.error) throw new HttpError(400, "Current password is incorrect.");
  const { error } = await admin.auth.admin.updateUserById(me.id, { password: newPassword });
  if (error) throw new HttpError(400, error.message);
  await admin.from("admin_users").update({ password_changed_at: new Date().toISOString() }).eq("user_id", me.id);
  if (me.role === "editor") await storePassword(me.id, newPassword);
  await log(me, "password_changed", { id: me.id, email: me.email });
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const me = await caller(req);
    const b = await req.json().catch(() => ({}));
    if (b.action === "change_own_password") return json(await changeOwnPassword(me, b));
    requireMainAdmin(me);
    switch (b.action) {
      case "list":
        return json(await list());
      case "create":
        return json(await create(me, b));
      case "update":
        return json(await update(me, b));
      case "reset_password":
        return json(await resetPassword(me, b));
      case "reveal_password":
        return json(await revealPassword(me, b));
      case "set_disabled":
        return json(await setDisabled(me, b));
      case "remove":
        return json(await remove(me, b));
      default:
        return json({ error: "Unknown action." }, 400);
    }
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error(err);
    return json({ error: "Something went wrong." }, 500);
  }
});
