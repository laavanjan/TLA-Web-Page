// Uploads team-page images to Cloudinary. The browser never sees the API
// secret: the `cloudinary-sign` Supabase Edge Function checks the admin's
// login and hands back one-off signatures, then files go straight from the
// browser to Cloudinary. See supabase/functions/cloudinary-sign/index.ts.
import { callEdgeFunction } from "../helpers/edgeFunction";

const FN = "cloudinary-sign";
const SIGNATURE_TTL_MS = 50 * 60 * 1000; // Cloudinary accepts them for 1 hour

const callFn = (body) => callEdgeFunction(FN, body);

// Pass this as `scope` for the home page wallpapers (main admins only).
export const WALLPAPER_SCOPE = "@wallpapers";
// ...and this for book PDFs and covers (main admins only); say which with `kind`.
export const BOOK_SCOPE = "@books";

const scopeBody = (scope, kind) => {
  if (scope === WALLPAPER_SCOPE) return { wallpapers: true };
  if (scope === BOOK_SCOPE) return { books: true, kind };
  return typeof scope === "string" ? { eventId: scope } : { teamId: scope };
};

// `scope` is a team id (number) for team pages or an event id (string, e.g.
// "thaipongal") for event pages; uploads land in that team's / event's folder.
// For BOOK_SCOPE, `kind` is "pdf" (the book itself) or "cover" (a picture).
// -> [{ cloudName, apiKey, signature, params, fetchedAt }]
export async function signUploads(scope, count, { kind } = {}) {
  const data = await callFn({ action: "sign", ...scopeBody(scope, kind), count });
  const fetchedAt = Date.now();
  return data.uploads.map((u) => ({ ...u, cloudName: data.cloudName, fetchedAt }));
}

export const signatureFresh = (s) => Date.now() - s.fetchedAt < SIGNATURE_TTL_MS;

// -> Promise<{ url, publicId, width, height, bytes, format, pages }> (pages: PDFs only)
export function uploadSigned(blob, signed, { onProgress, signal, filename = "image" } = {}) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", blob, filename);
    Object.entries(signed.params).forEach(([k, v]) => form.append(k, String(v)));
    form.append("api_key", signed.apiKey);
    form.append("signature", signed.signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* handled below */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body && body.secure_url) {
        resolve({
          url: body.secure_url,
          publicId: body.public_id,
          width: body.width || 0,
          height: body.height || 0,
          bytes: body.bytes || blob.size,
          format: body.format || "",
          pages: body.pages || 0,
        });
      } else {
        reject(new Error((body && body.error && body.error.message) || `Upload failed (HTTP ${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error - check your connection and retry."));
    xhr.onabort = () => {
      const err = new Error("Upload cancelled.");
      err.name = "AbortError";
      reject(err);
    };
    if (signal) {
      if (signal.aborted) {
        xhr.onabort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.send(form);
  });
}

// Deletes images this feature uploaded. Resolves to { deleted, failed }.
export async function deleteImages(publicIds) {
  const ids = [...new Set(publicIds)];
  const out = { deleted: [], failed: [] };
  for (let i = 0; i < ids.length; i += 60) {
    const chunk = ids.slice(i, i + 60);
    try {
      const r = await callFn({ action: "delete", publicIds: chunk });
      out.deleted.push(...(r.deleted || []));
      out.failed.push(...(r.failed || []));
    } catch {
      out.failed.push(...chunk);
    }
  }
  return out;
}

export function formatBytes(n) {
  if (!n) return "0 KB";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}
