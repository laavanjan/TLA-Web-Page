// Upload queue for the admin: optimise each photo in the browser (one at a
// time), fetch signatures in batches, upload a few files in parallel with
// progress, and hand finished uploads back *in the order they were added* —
// so a batch of event photos lands in the gallery in sequence even though the
// uploads finish out of order.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { prepareImage } from "./imagePrep";
import { signUploads, signatureFresh, uploadSigned } from "./cloudinaryUpload";

// Provided by the admin page: which team (a number) or event (a string id)
// uploads belong to, and a counter of editors with uploads in flight (Publish
// waits for them).
export const UploadContext = createContext({ teamId: null, onBusy: () => {} });

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i;
export const isImageFile = (f) => (f.type ? f.type.startsWith("image/") : false) || IMAGE_EXT.test(f.name || "");

const ACTIVE = ["queued", "preparing", "ready", "uploading"];
let keySeq = 0;

export function useImageUploads({ onDone, concurrency = 3 } = {}) {
  const { teamId, onBusy } = useContext(UploadContext);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ count: 0, before: 0, after: 0 });

  const itemsRef = useRef([]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const pool = useRef([]);
  const signing = useRef(null);
  const prepping = useRef(false);
  const uploading = useRef(0);
  const controllers = useRef(new Map());
  const alive = useRef(true);

  const busy = items.some((x) => ACTIVE.includes(x.status));

  useEffect(() => {
    if (!busy) return undefined;
    onBusy(1);
    return () => onBusy(-1);
  }, [busy, onBusy]);

  useEffect(() => {
    alive.current = true;
    const ctrls = controllers.current;
    return () => {
      alive.current = false;
      ctrls.forEach((c) => c.abort());
      itemsRef.current.forEach((x) => x.preview && URL.revokeObjectURL(x.preview));
    };
  }, []);

  const sync = () => alive.current && setItems(itemsRef.current);
  const get = (key) => itemsRef.current.find((x) => x.key === key);
  const patch = (key, changes) => {
    itemsRef.current = itemsRef.current.map((x) => (x.key === key ? { ...x, ...changes } : x));
    sync();
  };

  // Commit finished uploads from the front of the queue. Failed items don't
  // hold the queue up; anything still in progress does.
  const flush = () => {
    const done = [];
    for (const it of itemsRef.current) {
      if (it.status === "done") done.push(it);
      else if (it.status !== "error") break;
    }
    if (!done.length) return;
    itemsRef.current = itemsRef.current.filter((x) => !done.includes(x));
    sync();
    done.forEach((it) => {
      if (it.preview) URL.revokeObjectURL(it.preview);
      if (onDoneRef.current) onDoneRef.current(it.result, it);
    });
    if (alive.current) {
      setStats((s) => ({
        count: s.count + done.length,
        before: s.before + done.reduce((n, x) => n + x.before, 0),
        after: s.after + done.reduce((n, x) => n + x.result.bytes, 0),
      }));
    }
  };

  const getSignature = async () => {
    pool.current = pool.current.filter(signatureFresh);
    if (pool.current.length) return pool.current.shift();
    if (!signing.current) {
      const need = itemsRef.current.filter((x) => ["queued", "preparing", "ready"].includes(x.status)).length;
      signing.current = signUploads(teamId, Math.min(30, need + 1))
        .then((list) => {
          pool.current.push(...list);
        })
        .finally(() => {
          signing.current = null;
        });
    }
    await signing.current;
    return getSignature();
  };

  const uploadWorker = async () => {
    for (;;) {
      const it = itemsRef.current.find((x) => x.status === "ready");
      if (!it || !alive.current) return;
      patch(it.key, { status: "uploading", progress: 0, error: "" });
      const ctrl = new AbortController();
      controllers.current.set(it.key, ctrl);
      try {
        const signed = await getSignature();
        if (ctrl.signal.aborted) throw Object.assign(new Error("cancelled"), { name: "AbortError" });
        const result = await uploadSigned(it.blob, signed, {
          signal: ctrl.signal,
          filename: it.name,
          onProgress: (p) => get(it.key) && patch(it.key, { progress: p }),
        });
        if (get(it.key)) patch(it.key, { status: "done", progress: 1, result });
      } catch (err) {
        if (err.name !== "AbortError" && get(it.key)) {
          patch(it.key, { status: "error", stage: "upload", error: err.message || "Upload failed." });
        }
      } finally {
        controllers.current.delete(it.key);
      }
      flush();
    }
  };

  const kickUploads = () => {
    // An async function runs synchronously up to its first await, so each
    // worker claims its item before the loop checks again.
    while (uploading.current < concurrency && itemsRef.current.some((x) => x.status === "ready")) {
      uploading.current += 1;
      uploadWorker().finally(() => {
        uploading.current -= 1;
      });
    }
  };

  const prepLoop = async () => {
    if (prepping.current) return;
    prepping.current = true;
    try {
      for (;;) {
        const it = itemsRef.current.find((x) => x.status === "queued");
        if (!it || !alive.current) break;
        patch(it.key, { status: "preparing" });
        try {
          const r = await prepareImage(it.file);
          const cur = get(it.key);
          if (!cur) continue; // dismissed while we worked
          let preview = cur.preview;
          if (r.converted) {
            // Show the optimised copy: always decodable (HEIC isn't in Chrome).
            if (preview) URL.revokeObjectURL(preview);
            preview = URL.createObjectURL(r.blob);
          }
          patch(it.key, { status: "ready", blob: r.blob, after: r.blob.size, converted: r.converted, outType: r.blob.type, preview });
          kickUploads();
        } catch (err) {
          if (get(it.key)) patch(it.key, { status: "error", stage: "prepare", error: err.message || "Could not process image." });
          flush();
        }
      }
    } finally {
      prepping.current = false;
    }
  };

  const add = (fileList) => {
    const fresh = Array.from(fileList || []).map((file) => {
      keySeq += 1;
      const ok = isImageFile(file);
      return {
        key: `up${keySeq}`,
        file,
        name: file.name || "image",
        before: file.size,
        after: 0,
        progress: 0,
        status: ok ? "queued" : "error",
        stage: ok ? "" : "type",
        error: ok ? "" : "Not an image file.",
        preview: ok ? URL.createObjectURL(file) : "",
      };
    });
    if (!fresh.length) return 0;
    itemsRef.current = [...itemsRef.current, ...fresh];
    sync();
    prepLoop();
    return fresh.length;
  };

  const retry = (key) => {
    const it = get(key);
    if (!it || it.status !== "error" || it.stage === "type") return;
    patch(key, { status: it.blob ? "ready" : "queued", error: "", progress: 0 });
    if (it.blob) kickUploads();
    else prepLoop();
  };

  const dismiss = (key) => {
    const it = get(key);
    if (!it) return;
    const ctrl = controllers.current.get(key);
    if (ctrl) ctrl.abort();
    if (it.preview) URL.revokeObjectURL(it.preview);
    itemsRef.current = itemsRef.current.filter((x) => x.key !== key);
    sync();
    flush();
  };

  const retryAll = () => itemsRef.current.filter((x) => x.status === "error").forEach((x) => retry(x.key));
  const clearFailed = () => itemsRef.current.filter((x) => x.status === "error").forEach((x) => dismiss(x.key));

  return { items, stats, busy, add, retry, dismiss, retryAll, clearFailed, enabled: teamId != null };
}
