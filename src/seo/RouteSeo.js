// Default <head> tags for whatever page is open, from pages.json. Pages that
// know more about themselves (a book, an event made in the admin, a team
// page) render their own <Seo>, which wins. Admin pages are never indexed.
import React from "react";
import { useLocation } from "react-router-dom";
import Seo from "./Seo";
import seoPages from "./pages.json";
import { cleanPath } from "../analytics/classify";
import { breadcrumbs } from "./schema";

const { pages } = seoPages;

// Page titles by address, for breadcrumb trails.
export const PAGE_TITLES = Object.fromEntries(Object.entries(pages).filter(([, m]) => m.title).map(([p, m]) => [p, m.title]));

// Pages listed in pages.json get their breadcrumbs here; pages that aren't
// (a book, an event or team made in the admin) add their own.
export const hasListedPage = (path) => !!pages[cleanPath(path)];

export function pageMeta(pathname) {
  const path = cleanPath(pathname);
  if (path === "/admin" || path.startsWith("/admin/") || path === "/frame/admin") {
    return { path, title: "Admin", description: "", noindex: true, lang: "en" };
  }
  return { path, ...(pages[path] || { title: null, description: pages["/"].description }) };
}

export default function RouteSeo() {
  const { pathname } = useLocation();
  const meta = pageMeta(pathname);
  return (
    <Seo
      title={meta.title}
      description={meta.description}
      path={meta.path}
      image={meta.image}
      type={meta.type}
      lang={meta.lang || "ta"}
      noindex={!!meta.noindex}
      jsonLd={meta.title && !meta.noindex ? breadcrumbs(meta.path, meta.title, PAGE_TITLES) : null}
    />
  );
}
