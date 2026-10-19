// Default <head> tags for whatever page is open, from pages.json. Pages that
// know more about themselves (a book, an event made in the admin, a team
// page) render their own <Seo>, which wins. Admin pages are never indexed.
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Seo from "./Seo";
import seoPages from "./pages.json";
import { cleanPath } from "../analytics/classify";
import { breadcrumbs, organizationSchema } from "./schema";
import { fetchContactConfig, getCachedContactConfig } from "../shared/contactConfig";

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

// The contact details from /admin/contact, for the home page's organisation data.
function useContact(enabled) {
  const [contact, setContact] = useState(getCachedContactConfig);
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    fetchContactConfig()
      .then((c) => alive && setContact(c))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [enabled]);
  return contact;
}

export default function RouteSeo() {
  const { pathname } = useLocation();
  const meta = pageMeta(pathname);
  const home = meta.path === "/";
  const contact = useContact(home);
  return (
    <Seo
      title={meta.title}
      description={meta.description}
      path={meta.path}
      image={meta.image}
      type={meta.type}
      lang={meta.lang || "ta"}
      noindex={!!meta.noindex}
      jsonLd={
        home ? organizationSchema(contact) : meta.title && !meta.noindex ? breadcrumbs(meta.path, meta.title, PAGE_TITLES) : null
      }
    />
  );
}
