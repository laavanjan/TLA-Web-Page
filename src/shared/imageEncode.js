// Resizes a photo and re-encodes it as WebP before upload. Runs both inside
// imagePrep.worker.js (OffscreenCanvas, off the main thread) and on the main
// thread as a fallback, so it must not touch `document` unless it exists.
//
// Why bother when Cloudinary already serves WebP/AVIF? A 6 MB phone photo
// becomes ~0.5 MB: uploads finish in seconds on mobile data, the free plan's
// storage lasts ~10x longer, nothing hits the 10 MB per-file limit, and
// re-drawing through a canvas drops EXIF metadata — including GPS location.

export const MAX_EDGE = 2560;
export const QUALITY = 0.88;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // Cloudinary free plan

const KEEP_AS_IS = new Set(["image/gif", "image/svg+xml"]); // animation / vector

function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function loadImageElement(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

// Decodes with the camera's EXIF rotation applied, so portrait phone photos
// don't come out sideways.
async function decode(blob) {
  if (typeof createImageBitmap === "function") {
    let bmp;
    try {
      bmp = await createImageBitmap(blob, { imageOrientation: "from-image" });
    } catch {
      try {
        bmp = await createImageBitmap(blob); // browsers that reject the option
      } catch {
        bmp = null;
      }
    }
    if (bmp) return { source: bmp, width: bmp.width, height: bmp.height, release: () => bmp.close() };
  }
  if (typeof document !== "undefined") return loadImageElement(blob);
  throw new Error("decode");
}

// Halving in steps before the final draw avoids the shimmering/aliasing a
// single large downscale produces.
function drawScaled(source, sw, sh, w, h) {
  let cur = source;
  let cw = sw;
  let ch = sh;
  while (cw / 2 >= w && ch / 2 >= h) {
    const nw = Math.round(cw / 2);
    const nh = Math.round(ch / 2);
    const step = makeCanvas(nw, nh);
    const sctx = step.getContext("2d");
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(cur, 0, 0, nw, nh);
    cur = step;
    cw = nw;
    ch = nh;
  }
  const out = makeCanvas(w, h);
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(cur, 0, 0, w, h);
  return out;
}

function encode(canvas, type, quality) {
  if (canvas.convertToBlob) return canvas.convertToBlob({ type, quality });
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), type, quality)
  );
}

// Returns { blob, width, height, converted, note }. `converted: false` means
// the original file is uploaded untouched (GIFs, formats this browser can't
// decode such as HEIC outside Safari, or when re-encoding wouldn't help).
export async function encodeImage(file) {
  const original = (note) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        note === "decode"
          ? "This browser can't read this file type, and it's over 10 MB. Convert it to JPEG first."
          : "File is over 10 MB."
      );
    }
    return { blob: file, width: 0, height: 0, converted: false, note };
  };

  if (KEEP_AS_IS.has(file.type)) return original("kept");

  let img;
  try {
    img = await decode(file);
  } catch {
    return original("decode"); // e.g. HEIC on Chrome — Cloudinary converts it
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = drawScaled(img.source, img.width, img.height, w, h);

    let blob = await encode(canvas, "image/webp", QUALITY);
    // Safari can't encode WebP and silently hands back a PNG instead.
    if (blob.type !== "image/webp") {
      if (file.type === "image/png" && scale === 1 && file.size <= MAX_UPLOAD_BYTES) {
        return original("kept"); // keep transparency rather than flatten to JPEG
      }
      blob = await encode(canvas, "image/jpeg", QUALITY);
    }

    // An already-small, already-web-friendly file can grow when re-encoded;
    // keep the original then. JPEGs are always re-encoded so their EXIF/GPS
    // data is stripped.
    const webFriendly = file.type === "image/webp" || file.type === "image/png";
    if (scale === 1 && webFriendly && blob.size >= file.size) return original("kept");

    return { blob, width: w, height: h, converted: true, note: "" };
  } finally {
    img.release();
  }
}
