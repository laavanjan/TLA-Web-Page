import React from "react";
import { Link } from "react-router-dom";
import { Grid, Container } from "@mui/material";
import "./event.css";
import Heading from "../../../shared/Heading";
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
              <Heading>{category.title}</Heading>
              <div className="intro-heading1">{category.intro}</div>
              <Grid container direction="row" justifyContent="space-around" alignItems="center" spacing={4}>
                {cards.map((event) => (
                  <Grid item xl={4} lg={4} md={4} sm={6} xs={12} key={event.id}>
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
