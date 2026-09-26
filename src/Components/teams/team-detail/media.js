import React, { useMemo, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { imageCandidates, youTubeThumb } from "../../../shared/mediaLinks";

// An <img> for Drive/Cloudinary/plain links that tries each candidate URL in
// turn and renders `fallback` once all of them fail.
export function SmartImage({ src, width = 1600, alt = "", fallback = null, ...rest }) {
  const candidates = useMemo(() => imageCandidates(src, width), [src, width]);
  const key = candidates.join("|");
  const [failed, setFailed] = useState({ key: "", n: 0 });
  const idx = failed.key === key ? failed.n : 0;

  if (idx >= candidates.length) return fallback;
  return (
    <img
      {...rest}
      src={candidates[idx]}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed({ key, n: idx + 1 })}
    />
  );
}

// Shows the thumbnail only; the (heavy) YouTube player loads on click.
export function LiteYouTube({ id, title = "YouTube video" }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="yt-lite">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play: ${title}`}>
          <img src={youTubeThumb(id)} alt="" loading="lazy" />
          <span className="yt-lite-play">
            <FaPlay />
          </span>
        </button>
      )}
    </div>
  );
}

export function InstagramEmbed({ post }) {
  return (
    <div className="ig-embed">
      <iframe src={post.embedUrl} title={`Instagram ${post.kind}`} loading="lazy" scrolling="no" />
    </div>
  );
}
