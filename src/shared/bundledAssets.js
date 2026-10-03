// Images that ship inside the website itself (event illustrations, medals,
// past-project photos, …) can't be stored in the database by URL: webpack
// renames them on every build. A saved page refers to them by a stable key
// instead - "asset:jeevanathi/flood1" - and this registry turns the key into
// the real file at render time.
//
// The keys are registered once, in src/Components/events/eventsAssets.js.
const registry = new Map();

const KEY_RE = /^asset:[\w/.-]{1,80}$/;

export const isBundledKey = (value) => KEY_RE.test(String(value || "").trim());

export function setBundledAssets(assets) {
  Object.entries(assets).forEach(([key, url]) => registry.set(`asset:${key}`, url));
}

// The file behind a key, or "" if the key is unknown.
export const bundledAsset = (key) => registry.get(String(key || "").trim()) || "";
