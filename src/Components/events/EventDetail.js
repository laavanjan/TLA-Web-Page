// One event page, built from the sections an admin arranged (or the event's
// built-in sections). Used by the public event routes and by the admin's
// Preview tab.
import React from "react";
import { Helmet } from "react-helmet";
import { Container, Grid } from "@mui/material";
import { SmartImage } from "../teams/team-detail/media";
import {
  TextSection,
  TimelineSection,
  YouTubeSection,
  InstagramSection,
  CompetitionsSection,
  GallerySection,
} from "../teams/team-detail/TeamDetail";
import {
  AgendaSection,
  SponsorsSection,
  AwardsSection,
  RulesSection,
  CardsSection,
  ContactsSection,
  FactsSection,
  EditionsSection,
  LiveSection,
  ActionLink,
} from "./EventSections";
import { EVENT_SECTION_META } from "./eventSectionMeta";
import { youTubeId, instagramPost } from "../../shared/mediaLinks";
import "../../shared/intro/intro.css";
import "../teams/team-detail/teamDetail.css";
import "./eventDetail.css";

const BODIES = {
  text: TextSection,
  timeline: TimelineSection,
  youtube: YouTubeSection,
  instagram: InstagramSection,
  competitions: CompetitionsSection,
  gallery: GallerySection,
  agenda: AgendaSection,
  sponsors: SponsorsSection,
  awards: AwardsSection,
  rules: RulesSection,
  cards: CardsSection,
  contacts: ContactsSection,
  facts: FactsSection,
  editions: EditionsSection,
};

// Sections with nothing to show are skipped rather than rendered empty.
function hasContent(s) {
  switch (s.type) {
    case "intro":
    case "live":
      return true;
    case "text":
      return !!(s.text || s.buttonUrl);
    case "agenda":
      return !!(s.items.length || s.images.length || s.lead || s.heading || s.date || s.time || s.venue);
    case "gallery":
      return s.images.length > 0;
    case "youtube":
      return s.links.some(youTubeId);
    case "instagram":
      return s.links.some(instagramPost);
    default:
      return (s.items || []).length > 0;
  }
}

// The big opening of the page: name, illustration, a few lines and details.
function EventIntro({ page, s }) {
  const text = s.text || page.summary;
  const image = s.image || page.image;
  return (
    <div className="event-landing-container-div evx-intro">
      <Container maxWidth="" className="event-landing-container">
        <div className="event-landing-heading1">{s.title || page.title}</div>
        {image && <SmartImage src={image} width={1200} alt="" className="event-icon" loading="eager" />}
        <Grid container direction="column" justifyContent="center" alignItems="center">
          <Grid item sm={12}>
            <Container maxWidth="md">
              {text && <div className="event-intro-decription">{text}</div>}
              {(s.date || s.venue) && (
                <div className="evx-intro-meta">
                  {s.date && <span>{s.date}</span>}
                  {s.venue && <span>{s.venue}</span>}
                </div>
              )}
              {s.buttonUrl && (
                <div className="evx-intro-action">
                  <ActionLink url={s.buttonUrl} className="evx-link evx-link-solid">
                    {s.buttonLabel || "மேலும் அறிய"}
                  </ActionLink>
                </div>
              )}
            </Container>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

// Pages without an introduction section still get a heading.
function PlainHero({ page }) {
  return (
    <div className="team-hero evx-plain-hero">
      <h1 className="team-hero-title">{page.title}</h1>
      {page.summary && <p className="team-hero-tagline">{page.summary}</p>}
    </div>
  );
}

// Consecutive ordinary sections share one white-card column; a built-in
// block breaks out to the full width because it brings its own layout.
function groupSections(sections) {
  const groups = [];
  sections.forEach((s) => {
    const last = groups[groups.length - 1];
    if (s.type === "live") groups.push({ live: true, items: [s] });
    else if (last && !last.live) last.items.push(s);
    else groups.push({ live: false, items: [s] });
  });
  return groups;
}

const EventDetail = ({ page, preview = false }) => {
  const visible = page.sections.filter((s) => !s.hidden && hasContent(s));
  const intro = visible.find((s) => s.type === "intro");
  const groups = groupSections(visible.filter((s) => s.type !== "intro"));
  const description = page.summary || (intro && intro.text) || "";

  return (
    <div className="team-detail-page event-page">
      {!preview && (
        <Helmet>
          <title>{`${page.title} | தமிழ் இலக்கிய மன்றம்`}</title>
          <meta name="description" content={description} />
          <meta name="keywords" content={`TLA, Tamil Literary Association, ${page.title}`} />
        </Helmet>
      )}

      {intro ? (
        <EventIntro page={page} s={intro} />
      ) : (
        // A built-in block that opens the page brings its own heading.
        !(groups[0] && groups[0].live) && <PlainHero page={page} />
      )}

      {groups.map((g, gi) =>
        g.live ? (
          <div className="evx-live" key={g.items[0].id}>
            <LiveSection s={g.items[0]} />
          </div>
        ) : (
          <div className="evx-band" key={`g${gi}`}>
            <div className="team-detail-body evx-body">
              {g.items.map((s) => {
                const Body = BODIES[s.type];
                const meta = EVENT_SECTION_META[s.type];
                const Icon = meta.icon;
                return (
                  <section className={`team-section evx-section evx-section-${s.type}`} id={`event-sec-${s.id}`} key={s.id}>
                    {s.title && (
                      <h2 className="team-section-title">
                        <Icon className="team-section-icon" /> {s.title}
                      </h2>
                    )}
                    <Body s={s} page={page} />
                  </section>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default EventDetail;
