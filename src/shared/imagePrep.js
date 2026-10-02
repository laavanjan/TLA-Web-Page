// prepareImage(file) — resize + WebP-encode a photo before upload, in a Web
// Worker when the browser supports OffscreenCanvas, otherwise on the main
// thread. Files are processed one at a time to keep memory flat when someone
// drops 50 full-size photos at once.
import { encodeImage } from "./imageEncode";

let worker = null;
let workerBroken = false;
let seq = 0;
const waiting = new Map();

function getWorker() {
  if (workerBroken) return null;
  if (worker) return worker;
  const supported =
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof createImageBitmap === "function";
  if (!supported) return null;
  try {
    worker = new Worker(new URL("./imagePrep.worker.js", import.meta.url));
    worker.onmessage = (e) => {
      const job = waiting.get(e.data.id);
      if (!job) return;
      waiting.delete(e.data.id);
      if (e.data.ok) job.resolve(e.data.result);
      else job.reject(new Error(e.data.error));
    };
    worker.onerror = () => {
      // The worker itself failed to load — finish on the main thread.
      workerBroken = true;
      waiting.forEach((job) => job.reject(new Error("worker")));
      waiting.clear();
      worker = null;
    };
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

function inWorker(w, file) {
  return new Promise((resolve, reject) => {
    seq += 1;
    waiting.set(seq, { resolve, reject });
    w.postMessage({ id: seq, file });
  });
}

async function run(file) {
  const w = getWorker();
  if (w) {
    try {
      return await inWorker(w, file);
    } catch {
      // Some browsers expose OffscreenCanvas without everything we need in a
      // worker; the main thread gets the final word on whether a file works.
    }
  }
  return encodeImage(file);
}

let chain = Promise.resolve();

export function prepareImage(file) {
  const next = chain.then(() => run(file));
  chain = next.catch(() => {});
  return next;
}
