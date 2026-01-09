import React from "react";
import { Link } from "react-router-dom";
import { Grid, Container } from "@mui/material";
import "./event.css";
import Heading from "../../../shared/Heading";
import {
  cultureEvent,
  competition,
  guidance,
  social,
  carnival,
} from "../../../shared/EventDetails";
import {greetName} from "greet_name";

function Event() {
  return (
    <>
      <div className="event-container-div" id="event">
        <Container maxWidth="lg" className="event-container" sx={{ pb: 4 }}>
          <Heading>கலை கலாச்சார நிகழ்வுகள்</Heading>
          <div className="intro-heading1">
            பல்கலையில் பயிலும் தமிழ் மாணவர்களின் இயல், இசை, நாடகம் போன்ற
            கலைத்திறமைகளை வெளி உலகிற்கு பறைசாற்றிட மொறட்டுவை பல்கலைக்கழக தமிழ்
            மாணவர்களால் கோலாகலமாக நடத்தப்படும் நிகழ்வுகள்
          </div>
          <Grid
            container
            direction="row"
            justifyContent="space-around"
            alignItems="center"
            spacing={4}
          >
            {cultureEvent.map((event, index) => (
              <>
                <Grid item xl="4" lg="4" md="4" sm="6" xs="12" key={index}>
                  <Link to={event.link}>
                    <div className="event-card">
                      <div className="event-card-top">
                        <div className="event-card-title"> {event.title}</div>
                        <div>
                          <img src={event.img} alt="" className="event-img" />
                        </div>
                      </div>
                      <div className="event-heading1">{event.descriiption}</div>
                    </div>
                  </Link>
                </Grid>
              </>
            ))}
          </Grid>
        </Container>
        <Container maxWidth="lg" className="event-container" sx={{ pb: 4 }}>
          <Heading>போட்டிகள்</Heading>
          <div className="intro-heading1">
            தமிழர் தேசம் எங்கிலும் பரந்து வாழும் பாடசாலை மாணவர்களின் பல்முக
            திறமைகளுக்கு களம் அமைத்து அகில இலங்கைரீதியில் அந்த சாதனை
            வீர்ர்களுக்கு அங்கீகாரத்தை வழங்க தமிழ் இலக்கிய மன்றத்தால்
            பெருமையுடன் நடாத்தபடும் போட்டிகள்
          </div>
          <Grid
            container
            spacing={4}
            // columns={16}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            {competition.map((event, index) => (
              <>
                <Grid item xl="4" lg="4" md="4" sm="6" xs="12" key={index}>
                  <Link to={event.link}>
                    <div className="event-card">
                      <div className="event-card-top">
                        <div
                          className="event-card-title"
                          onClick={() => greetName(event.title)}
                        >
                          {" "}
                          {event.title}
                        </div>
                        <div>
                          <img src={event.img} alt="" className="event-img" />
                        </div>
                      </div>
                      <div className="event-heading1">{event.descriiption}</div>
                    </div>
                  </Link>
                </Grid>
              </>
            ))}
          </Grid>
        </Container>
      </div>
      <div>
        <Container maxWidth="lg" className="event-container" sx={{ pb: 4 }}>
          <Heading>தொழில் வழிகாட்டுதல்</Heading>
          <div className="intro-heading1">
            தாங்கள் கடந்து வந்த அனுபவங்களையும் படிப்பினைகளையும் தமது தம்பி,
            தங்கைகளுக்கும் கூறி அவர்களை வழிநடத்தி அவர்களின் இலக்குகளை அடைய
            கைகோர்க்கும் சிரேஷ்ட மாணவர்களுக்கும் பல்கலைக்கழக மாணவர்களுக்குமான
            உறவுப்பாலம்
          </div>
          <Grid
            container
            spacing={4}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            {guidance.map((event, index) => (
              <>
                <Grid item xl="4" lg="4" md="3" sm="6" xs="12" key={index}>
                  <Link to={event.link}>
                    <div className="event-card">
                      <div className="event-card-top">
                        <div className="event-card-title"> {event.title}</div>
                        <div>
                          <img src={event.img} alt="" className="event-img" />
                        </div>
                      </div>
                      <div className="event-heading1">{event.descriiption}</div>
                    </div>
                  </Link>
                </Grid>
              </>
            ))}
          </Grid>
        </Container>
      </div>
      <div className="event-container-div" id="event">
        <Container maxWidth="lg" className="event-container" sx={{ pb: 4 }}>
          <Heading>சமூக தொடர்பு</Heading>
          <div className="intro-heading1">
            ஏட்டுக்கல்வி முதல் பல்கலைக்கழகம் வரை தன்னை வழிப்படுத்தி ஒரு ஆளுமை
            மிக்க மாணவனாய் செதுக்கி தன்னை உருவாக்கிய இந்த சமூகத்திற்கு தன்னால்
            முடிந்த எதோ ஒன்றை செய்தே ஆகவேன்றும் என்ற ஒரு ஏக்கத்தின்
            வெளிப்பாடுகள்
          </div>
          <Grid
            container
            direction="row"
            justifyContent="space-around"
            alignItems="center"
            spacing={4}
          >
            {social.map((event, index) => (
              <>
                <Grid item xl="4" lg="4" md="4" sm="6" xs="12" key={index}>
                  <Link to={event.link}>
                    <div className="event-card">
                      <div className="event-card-top">
                        <div className="event-card-title"> {event.title}</div>
                        <div>
                          <img src={event.img} alt="" className="event-img" />
                        </div>
                      </div>
                      <div className="event-heading1">{event.descriiption}</div>
                    </div>
                  </Link>
                </Grid>
              </>
            ))}
          </Grid>
        </Container>
        <Container maxWidth="lg" className="event-container" sx={{ pb: 4 }}>
          <Heading>களியாட்டங்கள்</Heading>
          <div className="intro-heading1">
            ஓடி ஓடி களைத்திருக்கும் பல்கலைக்கழக மாணவர்கள் ஒய்யாரமாக கதைபேசி சக
            நண்பர்களுடன் உறவாடி கவலைகளை மறந்திருக்கும் தருணங்கள்
          </div>
          <Grid
            container
            spacing={4}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            {carnival.map((event, index) => (
              <>
                <Grid item xl="4" lg="4" md="4" sm="6" xs="12" key={index}>
                  <Link to={event.link}>
                    <div className="event-card">
                      <div className="event-card-top">
                        <div className="event-card-title"> {event.title}</div>
                        <div>
                          <img src={event.img} alt="" className="event-img" />
                        </div>
                      </div>
                      <div className="event-heading1">{event.descriiption}</div>
                    </div>
                  </Link>
                </Grid>
              </>
            ))}
          </Grid>
        </Container>
      </div>
    </>
  );
}

export default Event;
