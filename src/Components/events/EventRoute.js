// The router's elements for event pages. Each reads the page (the admin's
// published version, or the built-in content) and hands it to EventDetail.
import React from "react";
import { useParams } from "react-router-dom";
import EventDetail from "./EventDetail";
import ComingSoon from "../../shared/comingSoon/ComingSoon";
import { useEventPages } from "../../shared/eventPages";

// A page whose address is fixed in the router (/events/thaipongal, /ideathon…).
export function EventRoute({ id }) {
  const { pages } = useEventPages();
  const page = pages.find((p) => p.id === id);
  return page ? <EventDetail page={page} /> : <ComingSoon />;
}

// /events/:slug - events made in the admin. Waits for the first answer from
// the database before deciding the event doesn't exist.
export function CustomEventRoute() {
  const { slug } = useParams();
  const { pages, loaded } = useEventPages();
  const page = pages.find((p) => p.id === slug && !p.builtIn);
  if (page) return <EventDetail page={page} />;
  return loaded ? <ComingSoon /> : null;
}

// /events/brammam/:event - one page per competition, stored as brammam-<name>.
export function BrammamCompetitionRoute() {
  const { event } = useParams();
  const { pages } = useEventPages();
  const page = pages.find((p) => p.id === `brammam-${event}`);
  return page ? <EventDetail page={page} /> : <ComingSoon />;
}
