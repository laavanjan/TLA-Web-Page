// Everything search engines and share previews read from a page's <head>:
// title, description, canonical link, Open Graph / Twitter tags, language and
// whether it should be indexed. Put one on a page and it wins over the
// defaults set for every route in App.js (the deepest <Helmet> wins).
// jsonLd: one structured-data object or a list of them (see schema.js).
import React from "react";
import { Helmet } from "react-helmet";
import { SITE_NAME, SITE_NAME_EN, DEFAULT_IMAGE, absoluteUrl, clip } from "./site";

export default function Seo({ title, description, path, image, type = "website", lang = "ta", noindex = false, jsonLd }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_NAME_EN} (TLA UoM)`;
  const desc = clip(description);
  const url = absoluteUrl(path || (typeof window !== "undefined" ? window.location.pathname : "/"));
  const img = absoluteUrl(image || DEFAULT_IMAGE);

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME_EN} />
      <meta property="og:locale" content={lang === "ta" ? "ta_LK" : "en_GB"} />
      <meta property="og:title" content={title || fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || fullTitle} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={img} />
      {[].concat(jsonLd || []).map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
