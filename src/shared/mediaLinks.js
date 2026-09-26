// Turns the links admins paste (YouTube, Instagram, Google Drive, Cloudinary)
// into things the site can embed. Only http(s) URLs are ever used, so a pasted
// `javascript:` link can never end up in an href or src.

export function safeUrl(url) {
  const s = String(url || "").trim();
  return /^https?:\/\/[^\s]+$/i.test(s) ? s : "";
}

function parse(url) {
  const s = safeUrl(url);
  if (!s) return null;
  try {
    const u = new URL(s);
    return { u, host: u.hostname.toLowerCase().replace(/^(www|m)\./, "") };
  } catch {
    return null;
  }
}

export function youTubeId(url) {
  const p = parse(url);
  if (!p) return null;
  const { u, host } = p;
  let id = null;
  if (host === "youtu.be") {
    id = u.pathname.slice(1).split("/")[0];
  } else if (["youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(host)) {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
      if (m) id = m[1];
    }
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

export const youTubeThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

// instagram.com/p/CODE, /reel/CODE, /reels/CODE, /tv/CODE — optionally
// prefixed by a username (instagram.com/someone/p/CODE).
export function instagramPost(url) {
  const p = parse(url);
  if (!p || p.host !== "instagram.com") return null;
  const m = p.u.pathname.match(/^\/(?:[\w.]+\/)?(p|reels?|tv)\/([\w-]+)/);
  if (!m) return null;
  const code = m[2];
  return {
    code,
    kind: m[1].startsWith("reel") ? "Reel" : "Post",
    url: `https://www.instagram.com/p/${code}/`,
    embedUrl: `https://www.instagram.com/p/${code}/embed/`,
  };
}

export function driveFileId(url) {
  const p = parse(url);
  if (!p) return null;
  const { u, host } = p;
  let id = null;
  if (host === "drive.google.com" || host === "docs.google.com") {
    const m = u.pathname.match(/\/d\/([\w-]+)/);
    id = m ? m[1] : u.searchParams.get("id");
  } else if (host === "lh3.googleusercontent.com") {
    const m = u.pathname.match(/^\/d\/([\w-]+)/);
    if (m) id = m[1];
  }
  return id && /^[\w-]{10,}$/.test(id) ? id : null;
}

const CLOUDINARY_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i;

export function imageSource(url) {
  if (!safeUrl(url)) return "";
  if (driveFileId(url)) return "drive";
  if (CLOUDINARY_RE.test(url.trim())) return "cloudinary";
  return "web";
}

// Ordered list of URLs to try for an image; the <SmartImage> component falls
// through them on load errors. Drive files need "Anyone with the link" sharing.
export function imageCandidates(url, width = 1600) {
  const s = safeUrl(url);
  if (!s) return [];
  const driveId = driveFileId(s);
  if (driveId) {
    return [
      `https://lh3.googleusercontent.com/d/${driveId}=w${width}`,
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w${width}`,
    ];
  }
  const c = s.match(CLOUDINARY_RE);
  if (c) {
    const [, base, rest] = c;
    // Leave URLs that already carry transformations (e.g. "c_fill,w_400/…").
    const first = rest.split("/")[0];
    const hasTransform = /^[a-z]{1,3}_/.test(first);
    return hasTransform ? [s] : [`${base}f_auto,q_auto,w_${width}/${rest}`, s];
  }
  return [s];
}

// Splits pasted text into individual http(s) links (newlines, spaces, commas).
export function splitLinks(text) {
  return String(text || "")
    .split(/[\s,]+/)
    .map(safeUrl)
    .filter(Boolean);
}
