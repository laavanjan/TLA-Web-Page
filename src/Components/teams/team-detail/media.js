import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { imageCandidates, imageSrcSet, youTubeThumb, socialPlatform } from "../../../shared/mediaLinks";
import { SOCIAL_META } from "../socialMeta";

// An <img> for Drive/Cloudinary/plain links that tries each candidate URL in
// turn and renders `fallback` once all of them fail. For Cloudinary images,
// `widths` + `sizes` add a srcset so phones download a phone-sized file.
export function SmartImage({ src, width = 1600, widths, sizes, crop, alt = "", fallback = null, loading = "lazy", ...rest }) {
  const candidates = useMemo(() => imageCandidates(src, width), [src, width]);
  const srcSet = useMemo(() => (widths ? imageSrcSet(src, widths, crop) : ""), [src, widths, crop]);
  const key = candidates.join("|");
  const [failed, setFailed] = useState({ key: "", n: 0 });
  const idx = failed.key === key ? failed.n : 0;

  if (idx >= candidates.length) return fallback;
  return (
    <img
      {...rest}
      src={candidates[idx]}
      {...(srcSet && idx === 0 ? { srcSet, sizes } : {})}
      alt={alt}
      loading={loading}
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

// Instagram's embed page reports its real height to the parent page
// ({"type":"MEASURE","details":{"height":…}}); the iframe follows it so there's
// no blank space under short posts and nothing cut off on long ones.
export function InstagramEmbed({ post }) {
  const frame = useRef(null);
  const [height, setHeight] = useState(null);

  useEffect(() => {
    const onMessage = (e) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      if (!/^https:\/\/(www\.)?instagram\.com$/.test(e.origin)) return;
      try {
        const msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        const h = msg && msg.type === "MEASURE" && msg.details && Number(msg.details.height);
        if (h > 100 && h < 3000) setHeight(Math.ceil(h));
      } catch {
        /* not a message for us */
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="ig-embed">
      <iframe
        ref={frame}
        src={post.embedUrl}
        title={`Instagram ${post.kind}`}
        loading="lazy"
        scrolling="no"
        style={height ? { height } : undefined}
      />
    </div>
  );
}

// Brand icons for a team's profile links; unrecognised sites get a globe.
export function SocialIcons({ links, className = "team-socials" }) {
  const items = links
    .map((url) => ({ url, key: socialPlatform(url) }))
    .filter((x) => x.key);
  if (!items.length) return null;
  return (
    <div className={className}>
      {items.map(({ url, key }) => {
        const m = SOCIAL_META[key];
        const Icon = m.icon;
        const external = key !== "email";
        return (
          <a
            key={url}
            href={url}
            className="team-social"
            style={{ "--brand": m.color }}
            aria-label={m.label}
            title={m.label}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}
