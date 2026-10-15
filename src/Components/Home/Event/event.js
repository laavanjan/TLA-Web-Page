import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Grid, Container } from "@mui/material";
import "./event.css";
import Heading from "../../../shared/Heading";
import FxHeading from "../FxHeading";
import { useInView } from "../../../shared/scrollFx/scrollFx";
import { SmartImage } from "../../teams/team-detail/media";
import { useEventPages, homeGroups } from "../../../shared/eventPages";
import { greetName } from "greet_name";

// The cards come from the event pages (managed at /admin/events); the groups
// and their order are the admin's. Neighbouring groups that share a `band`
// sit on one shaded stripe, so the page keeps its alternating look.
function bandsOf(groups) {
  const bands = [];
  groups.forEach((g) => {
    const last = bands[bands.length - 1];
    if (last && last.band === g.category.band) last.groups.push(g);
    else bands.push({ band: g.category.band, groups: [g] });
  });
  return bands;
}

// A card that lifts up off the page when it scrolls into view; cards in the
// same row follow one another (`--col`). See homeFx.css.
function FxCard({ col, children }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.12 });
  return (
    <div ref={ref} className={`fx-card ${seen ? "is-in" : ""}`} style={{ "--col": col }}>
      {children}
    </div>
  );
}

function Event() {
  const { pages, layout } = useEventPages();
  const bands = bandsOf(homeGroups(pages, layout));

  return (
    <>
      {bands.map((b, i) => (
        <div
          key={b.band}
          className={i % 2 === 0 ? "event-container-div event-band" : undefined}
          id={i === 0 ? "event" : undefined}
        >
          {b.groups.map(({ category, cards }) => (
            <Container key={category.id} maxWidth="lg" className="event-container" sx={{ pb: 4 }}>
              <FxHeading>
                <Heading>{category.title}</Heading>
              </FxHeading>
              <div className="intro-heading1 fx-lead">{category.intro}</div>
              <Grid container direction="row" justifyContent="space-around" alignItems="center" spacing={4}>
                {cards.map((event, index) => (
                  <Grid item xl={4} lg={4} md={4} sm={6} xs={12} key={event.id}>
                    <FxCard col={index % 3}>
                      <Link to={event.path}>
                        <div className="event-card">
                          <div className="event-card-top">
                            <div
                              className="event-card-title"
                              onClick={category.id === "competition" ? () => greetName(event.title) : undefined}
                            >
                              {" "}
                              {event.title}
                            </div>
                            <div>
                              <SmartImage src={event.image} width={600} alt="" className="event-img" />
                            </div>
                          </div>
                          <div className="event-heading1">{event.summary}</div>
                        </div>
                      </Link>
                    </FxCard>
                  </Grid>
                ))}
              </Grid>
            </Container>
          ))}
        </div>
      ))}
    </>
  );
}

export default Event;
