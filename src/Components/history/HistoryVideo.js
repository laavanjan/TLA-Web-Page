// The video at the top of the History page, shown as a designed poster: the
// video's full-HD frame (YouTube's own thumbnail is 480px and letterboxed),
// cropped past its black bars, warmed with a navy and gold tint, with the
// title over it and a gold play button. YouTube only loads once it's played.
import React, { useState } from "react";
import { FaPlay, FaYoutube } from "react-icons/fa";

// Best first. A size YouTube doesn't have comes back as a 120px grey
// placeholder, so that counts as missing too.
const thumbs = (id) => ["maxresdefault", "sddefault", "hqdefault"].map((q) => `https://i.ytimg.com/vi/${id}/${q}.jpg`);

export default function HistoryVideo({ id, title, kicker, subtitle }) {
  const [playing, setPlaying] = useState(false);
  const [n, setN] = useState(0);
  const list = thumbs(id);
  const next = () => setN((i) => Math.min(i + 1, list.length - 1));

  if (playing) {
    return (
      <div className="hv">
        <iframe
          className="hv-frame"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={subtitle || title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="hv">
      <button type="button" className="hv-poster" onClick={() => setPlaying(true)} aria-label={`காணொளியை இயக்கு: ${title}`}>
        <img
          className="hv-img"
          src={list[n]}
          alt=""
          loading="lazy"
          onLoad={(e) => e.currentTarget.naturalWidth <= 120 && n < list.length - 1 && next()}
          onError={next}
        />
        <span className="hv-shade" aria-hidden="true" />
        <span className="hv-badge" aria-hidden="true">
          <FaYoutube /> YouTube
        </span>
        <span className="hv-play" aria-hidden="true">
          <FaPlay />
        </span>
        <span className="hv-text">
          {kicker && <span className="hv-kicker">{kicker}</span>}
          <span className="hv-title">{title}</span>
          {subtitle && <span className="hv-sub">{subtitle}</span>}
        </span>
      </button>
    </div>
  );
}
