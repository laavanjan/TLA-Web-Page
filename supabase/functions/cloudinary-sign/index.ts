// Signs Cloudinary uploads and deletes for the team-page admin (/admin/teams)
// and the event-page admin (/admin/events).
//
// The Cloudinary API secret lives only here (as a Supabase secret). The
// browser asks this function for a short-lived signature, then uploads the
// file straight to Cloudinary — so files never pass through Supabase.
//
//   POST { action: "sign",   teamId: 1, count: 3 }          (team page photos)
//   POST { action: "sign",   eventId: "ppl", count: 3 }     (event page photos)
//     -> { cloudName, uploads: [{ apiKey, timestamp, signature, params }, …] }
//   POST { action: "sign",   wallpapers: true, count: 1 } (home page wallpapers, main admins only)
//   POST { action: "delete", publicIds: ["tla/teams/1/abc…", "tla/events/ppl/abc…", …] }
//     -> { deleted: [...], failed: [...] }
//
// Every request must carry a signed-in panel user's Supabase access token
// (supabase.functions.invoke() attaches it automatically). Main admins may
// work on any team or event; editors only on the teams and events they're
// assigned to (see supabase/migrations/team_editors.sql and event_pages.sql).
//
// Secrets (supabase secrets set NAME=value):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided
// automatically.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME") ?? "";
const API_KEY = Deno.env.get("CLOUDINARY_API_KEY") ?? "";
const API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

const ROOT = "tla/teams";
const EVENT_ROOT = "tla/events";
const WALLPAPER_ROOT = "tla/wallpapers";
const MAX_SIGN = 30; // signatures per request
const MAX_DELETE = 60; // public ids per request
const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif,avif,heic,heif";
// Only ever delete what this feature uploaded: tla/teams/<teamId>/<random id>
// or tla/events/<eventId>/<random id>.
const TEAM_ID_RE = /^tla\/teams\/(\d{1,3})\/[A-Za-z0-9_-]{8,64}$/;
const EVENT_ID_RE = /^tla\/events\/([a-z0-9][a-z0-9-]{0,48})\/[A-Za-z0-9_-]{8,64}$/;
const WALLPAPER_ID_RE = /^tla/wallpapers/[A-Za-z0-9_-]{8,64}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

async function sha1Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Cloudinary signature: params sorted by name, joined as k=v&k=v, then the
// API secret appended and SHA-1 hashed.
// https://cloudinary.com/documentation/authentication_signatures
function sign(params: Record<string, string | number>) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return sha1Hex(toSign + API_SECRET);
}

const randomId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 20);
const now = () => Math.floor(Date.now() / 1000);

type Access = {
  canEdit: (teamId: number) => boolean;
  canEditEvent: (eventId: string) => boolean;
  isAdmin: boolean; // main admin: may also manage the home page wallpapers
};

// Which teams and events the caller may upload to / delete from, or null for no access.
async function access(req: Request): Promise<Access | null> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!).auth.getUser(token);
  const user = data?.user;
  if (error || !user) return null;

  const service = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // deno-lint-ignore no-explicit-any
  let row: any = null;
  let roleErr: { code?: string } | null = null;
  ({ data: row, error: roleErr } = await service
    .from("admin_users")
    .select("role, disabled, admin_user_teams(team_id), admin_user_events(event_id)")
    .eq("user_id", user.id)
    .maybeSingle());
  if (roleErr?.code === "PGRST200") {
    // event_pages.sql not run yet: nobody has events, teams work as before.
    ({ data: row, error: roleErr } = await service
      .from("admin_users")
      .select("role, disabled, admin_user_teams(team_id)")
      .eq("user_id", user.id)
      .maybeSingle());
  }
  if (roleErr) {
    // Roles table not created yet (team_editors.sql not run): any signed-in
    // user, as before team editors existed.
    if (roleErr.code === "42P01" || roleErr.code === "PGRST205") {
      return { canEdit: () => true, canEditEvent: () => true, isAdmin: true };
    }
    throw roleErr;
  }
  if (!row || row.disabled) return null;
  if (row.role === "admin") return { canEdit: () => true, canEditEvent: () => true, isAdmin: true };
  const teams = new Set((row.admin_user_teams ?? []).map((t: { team_id: number }) => t.team_id));
  const events = new Set((row.admin_user_events ?? []).map((e: { event_id: string }) => e.event_id));
  return { canEdit: (teamId) => teams.has(teamId), canEditEvent: (eventId) => events.has(eventId), isAdmin: false };
}

async function signUploads(who: Access, body: Record<string, unknown>) {
  // A team page upload names a teamId, an event page upload an eventId.
  let folder: string;
  let tag: string;
  if (body.wallpapers === true) {
    if (!who.isAdmin) return json({ error: "Only main admins can change the home page wallpapers." }, 403);
    folder = WALLPAPER_ROOT;
    tag = "tla-wallpapers";
  } else if (typeof body.eventId === "string") {
    const slug = body.eventId;
    if (!SLUG_RE.test(slug)) return json({ error: "Invalid event." }, 400);
    if (!who.canEditEvent(slug)) return json({ error: "You can only upload photos to your own events' pages." }, 403);
    folder = `${EVENT_ROOT}/${slug}`;
    tag = `tla-event-${slug}`;
  } else {
    const id = Number(body.teamId);
    if (!Number.isInteger(id) || id < 1 || id > 999) return json({ error: "Invalid team." }, 400);
    if (!who.canEdit(id)) return json({ error: "You can only upload photos to your own team's page." }, 403);
    folder = `${ROOT}/${id}`;
    tag = `tla-team-${id}`;
  }
  const n = Math.min(MAX_SIGN, Math.max(1, Math.floor(Number(body.count) || 1)));
  const timestamp = now();

  const uploads = await Promise.all(
    Array.from({ length: n }, async () => {
      // Each signature is bound to one random public id, so it can only ever
      // create that single file inside this team's / event's folder.
      const params = {
        public_id: `${folder}/${randomId()}`,
        allowed_formats: ALLOWED_FORMATS,
        tags: tag,
        timestamp,
      };
      return { apiKey: API_KEY, signature: await sign(params), params };
    })
  );
  return json({ cloudName: CLOUD_NAME, uploads });
}

async function destroy(publicId: string) {
  const params = { public_id: publicId, invalidate: "true", timestamp: now() };
  const form = new FormData();
  Object.entries(params).forEach(([k, v]) => form.append(k, String(v)));
  form.append("api_key", API_KEY);
  form.append("signature", await sign(params));
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
    method: "POST",
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  // "not found" counts as success: the file is gone either way.
  return res.ok && (body.result === "ok" || body.result === "not found");
}

async function deleteImages(who: Access, publicIds: unknown) {
  if (!Array.isArray(publicIds) || publicIds.length === 0) return json({ deleted: [], failed: [] });
  if (publicIds.length > MAX_DELETE) return json({ error: `At most ${MAX_DELETE} images per request.` }, 400);
  const bad = publicIds.filter((p) => typeof p !== "string" || !(TEAM_ID_RE.test(p) || EVENT_ID_RE.test(p) || WALLPAPER_ID_RE.test(p)));
  if (bad.length) return json({ error: "Refusing to delete images outside tla/teams/, tla/events/ and tla/wallpapers/.", bad }, 400);
  // tla/teams/<teamId>/… or tla/events/<eventId>/… - the third path segment says whose it is.
  const mine = (p: string) =>
    p.startsWith("tla/wallpapers/")
      ? who.isAdmin
      : p.startsWith("tla/teams/") ? who.canEdit(Number(p.split("/")[2])) : who.canEditEvent(p.split("/")[2]);
  const notYours = publicIds.filter((p) => !mine(p as string));
  if (notYours.length) return json({ error: "You can only delete photos from your own teams and events.", bad: notYours }, 403);

  const ids = [...new Set(publicIds as string[])];
  const results = await Promise.all(ids.map((p) => destroy(p).catch(() => false)));
  return json({
    deleted: ids.filter((_, i) => results[i]),
    failed: ids.filter((_, i) => !results[i]),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return json({ error: "Cloudinary is not configured on the server." }, 500);
  }

  let who: Access | null;
  try {
    who = await access(req);
  } catch {
    return json({ error: "Couldn't check your permissions. Try again." }, 500);
  }
  if (!who) return json({ error: "Not signed in as an admin." }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Expected a JSON body." }, 400);
  }

  switch (body.action) {
    case "sign":
      return signUploads(who, body);
    case "delete":
      return deleteImages(who, body.publicIds);
    default:
      return json({ error: "Unknown action." }, 400);
  }
});
