/* eslint-disable no-restricted-globals */
// Decodes, resizes and re-encodes photos off the main thread so dropping a
// big batch never freezes the admin page. See imageEncode.js.
import { encodeImage } from "./imageEncode";

self.onmessage = async (e) => {
  const { id, file } = e.data;
  try {
    const result = await encodeImage(file);
    self.postMessage({ id, ok: true, result });
  } catch (err) {
    self.postMessage({ id, ok: false, error: (err && err.message) || "Could not process image." });
  }
};
