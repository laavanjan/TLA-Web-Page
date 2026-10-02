// Uploads team-page images to Cloudinary. The browser never sees the API
// secret: the `cloudinary-sign` Supabase Edge Function checks the admin's
// login and hands back one-off signatures, then files go straight from the
// browser to Cloudinary. See supabase/functions/cloudinary-sign/index.ts.
import { supabase } from "../helpers/supabaseClient";

const FN = "cloudinary-sign";
const SIGNATURE_TTL_MS = 50 * 60 * 1000; // Cloudinary accepts them for 1 hour

async function callFn(body) {
  const { data, error } = await supabase.functions.invoke(FN, { body });
  if (!error) return data;
  let msg = error.message || "Request failed.";
  const res = error.context;
  if (res && typeof res.json === "function") {
    if (res.status === 404) {
      msg = "Image uploads aren't set up yet - the cloudinary-sign function isn't deployed.";
    } else {
      try {
        const j = await res.json();
        if (j && j.error) msg = j.error;
      } catch {
        /* keep the generic message */
      }
    }
  } else if (error.name === "FunctionsFetchError") {
    msg = "Couldn't reach the upload service. Check your connection, or that the cloudinary-sign function is deployed.";
  }
  throw new Error(msg);
}

// -> [{ cloudName, apiKey, signature, params, fetchedAt }]
export async function signUploads(teamId, count) {
  const data = await callFn({ action: "sign", teamId, count });
  const fetchedAt = Date.now();
  return data.uploads.map((u) => ({ ...u, cloudName: data.cloudName, fetchedAt }));
}

export const signatureFresh = (s) => Date.now() - s.fetchedAt < SIGNATURE_TTL_MS;

// -> Promise<{ url, publicId, width, height, bytes, format }>
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
