// Signs Cloudinary uploads and deletes for the team-page admin (/admin/teams).
//
// The Cloudinary API secret lives only here (as a Supabase secret). The
// browser asks this function for a short-lived signature, then uploads the
// file straight to Cloudinary — so files never pass through Supabase.
//
//   POST { action: "sign",   teamId: 1, count: 3 }
//     -> { cloudName, uploads: [{ apiKey, timestamp, signature, params }, …] }
//   POST { action: "delete", publicIds: ["tla/teams/1/abc…", …] }
//     -> { deleted: [...], failed: [...] }
//
// Every request must carry a signed-in admin's Supabase access token
// (supabase.functions.invoke() attaches it automatically).
//
// Secrets (supabase secrets set NAME=value):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
//   ADMIN_EMAILS (optional) — comma-separated; when set, only these accounts
//   may upload or delete. Otherwise any signed-in Supabase user may, which
//   matches the team_pages RLS policy.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME") ?? "";
const API_KEY = Deno.env.get("CLOUDINARY_API_KEY") ?? "";
const API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET") ?? "";
const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const ROOT = "tla/teams";
const MAX_SIGN = 30; // signatures per request
const MAX_DELETE = 60; // public ids per request
const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif,avif,heic,heif";
// Only ever delete what this feature uploaded: tla/teams/<teamId>/<random id>.
const PUBLIC_ID_RE = /^tla\/teams\/\d{1,3}\/[A-Za-z0-9_-]{8,64}$/;

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

async function requireAdmin(req: Request) {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await supabase.auth.getUser(token);
  const user = data?.user;
  if (error || !user) return null;
  if (ADMIN_EMAILS.length && !ADMIN_EMAILS.includes((user.email ?? "").toLowerCase())) return null;
  return user;
}

async function signUploads(teamId: unknown, count: unknown) {
  const id = Number(teamId);
  if (!Number.isInteger(id) || id < 1 || id > 999) return json({ error: "Invalid team." }, 400);
  const n = Math.min(MAX_SIGN, Math.max(1, Math.floor(Number(count) || 1)));
  const timestamp = now();

  const uploads = await Promise.all(
    Array.from({ length: n }, async () => {
      // Each signature is bound to one random public id, so it can only ever
      // create that single file inside this team's folder.
      const params = {
        public_id: `${ROOT}/${id}/${randomId()}`,
        allowed_formats: ALLOWED_FORMATS,
        tags: `tla-team-${id}`,
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

async function deleteImages(publicIds: unknown) {
  if (!Array.isArray(publicIds) || publicIds.length === 0) return json({ deleted: [], failed: [] });
  if (publicIds.length > MAX_DELETE) return json({ error: `At most ${MAX_DELETE} images per request.` }, 400);
  const bad = publicIds.filter((p) => typeof p !== "string" || !PUBLIC_ID_RE.test(p));
  if (bad.length) return json({ error: "Refusing to delete images outside tla/teams/.", bad }, 400);

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

  const user = await requireAdmin(req);
  if (!user) return json({ error: "Not signed in as an admin." }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Expected a JSON body." }, 400);
  }

  switch (body.action) {
    case "sign":
      return signUploads(body.teamId, body.count);
    case "delete":
      return deleteImages(body.publicIds);
    default:
      return json({ error: "Unknown action." }, 400);
  }
});
