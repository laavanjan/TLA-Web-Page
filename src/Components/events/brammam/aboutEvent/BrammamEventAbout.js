import { Link, useParams } from "react-router-dom";
import ComingSoon from "../../../../shared/comingSoon/ComingSoon";
import { Container, Grid } from "@mui/material";
import Heading from "../../../../shared/Heading";
import "../intro/BrammamIntro.css";
import "./BrammamEventAbout.css";

import meerigai1 from "./winners/meerigai/1.jpg";
import meerigai2 from "./winners/meerigai/2.jpg";
import olisuvadu1 from "./winners/olisuvadu/1.jpg";
import olisuvadu2 from "./winners/olisuvadu/2.jpg";
import solalvalar1 from "./winners/solalvalar/1.jpg";
import solalvalar2 from "./winners/solalvalar/2.jpg";
import eluthoviyam1 from "./winners/eluthoviyam/1.jpg";
import eluthoviyam2 from "./winners/eluthoviyam/2.jpg";

import eluthoviyamImage from "../intro/images/eluthoviyam.png";
import meerigaiImage from "../intro/images/meerigai.png";
import olisuvaduImage from "../intro/images/oli_suvadu.png";
import solalvalarImage from "../intro/images/solvalar.png";
import { useEffect, useState } from "react";
import axios from "axios";

const BrammamEventAbout = () => {
  const { event } = useParams();
  const validEvents = ["meerigai", "olisuvadu", "solalvalar", "eluthoviyam"];

  const [eventDetails, setEventDetails] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  useEffect(() => {
    if (validEvents.includes(event)) {
      axios
        .get(`/api/brammams/${event}`)
        .then((res) => {
          setEventDetails(res.data[0]);
          setShowDetails({
            showWinners: res.data[0].showWinners,
            showCompetitionDetails: res.data[0].showCompetitionDetails,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  //   const showDetails = {
  //     meerigai: {
  //       showWinners: false,
  //       showCompetitionDetails: false,
  //     },
  //     olisuvadu: {
  //       showWinners: false,
  //       showCompetitionDetails: false,
  //     },
  //     solalvalar: {
  //       showWinners: false,
  //       showCompetitionDetails: false,
  //     },
  //     eluthoviyam: {
  //       showWinners: false,
  //       showCompetitionDetails: false,
  //     },
  //   };
  // first 2 are winners and last is logo
  const usedImages = [];
  if (event === "meerigai") {
    usedImages.push(meerigai1, meerigai2, meerigaiImage);
  } else if (event === "olisuvadu") {
    usedImages.push(olisuvadu1, olisuvadu2, olisuvaduImage);
  } else if (event === "solalvalar") {
    usedImages.push(solalvalar1, solalvalar2, solalvalarImage);
  } else if (event === "eluthoviyam") {
    usedImages.push(eluthoviyam1, eluthoviyam2, eluthoviyamImage);
  }

  const imageStyle = {
    height: "300px",
    width: "300px",
    marginTop: "30px",
    filter: "grayscale(100%)",
    objectFit: "cover",
    borderRadius: "40px",
  };

  if (validEvents.includes(event)) {
    return (
      <>
        <div className="pongal-landing-container-div">
          <Container>
            <div className="event-landing-heading1">
              {eventDetails?.nameTamil + " - 2024"}
            </div>
            <div style={{ marginTop: "50px" }} />
            <img
              src={usedImages[2]}
              alt=""
              className="event-icon"
              style={{ height: "39vh", filter: "grayscale(100%)" }}
            />
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
            >
              <Grid item sm="12">
                <Container maxWidth="md">
                  <div className="intro-decription">
                    {eventDetails?.description}
                  </div>
                </Container>
              </Grid>
            </Grid>
          </Container>
        </div>

        <Container>
          {showDetails?.showCompetitionDetails && (
            <>
              <Heading>கருப்பொருள்</Heading>
              <Grid item sm="12">
                <Container maxWidth="md">
                  <div
                    className="rules-decription"
                    style={{ color: "#717274" }}
                  >
                    <ol type="1">
                      {eventDetails?.themes.map((rule, index) => {
                        return <li key={index}>{rule}</li>;
                      })}
                    </ol>
                  </div>
                </Container>
              </Grid>

              <div>
                <Heading>
                  முடிவுத்திகதி:{" "}
                  {" " +
                    new Date(eventDetails?.deadline)
                      .toISOString()
                      .split("T")[0]}
                </Heading>
              </div>

              <Container maxWidth="md">
                <center>
                  <Link to={"rules"}>
                    <button
                      style={{
                        marginTop: "30px",
                        padding: "15px",
                        backgroundColor: "#DFE5E8",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        color: "#022345",
                        fontFamily: "Heading",
                        fontSize: "2vw",
                      }}
                    >
                      போட்டி விதி முறைகள்
                    </button>
                  </Link>
                </center>
              </Container>
            </>
          )}

          {showDetails?.showWinners && (
            <>
              <Heading>வெற்றியாளர்கள்</Heading>
              <Container
                maxWidth="md"
                className="event-container"
                sx={{ pb: 4 }}
              >
                <Grid
                  container
                  spacing={4}
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                    <div className="brammam-event-card">
                      <div className="brammam-event-card-top flex-center">
                        <div className="brammam-event-card-title">
                          1 ம் இடம்
                        </div>
                        <div>
                          <img src={usedImages[0]} alt="" style={imageStyle} />
                        </div>
                      </div>
                      <div className="brammam-event-heading1 flex-center">
                        <div>
                          <b>{eventDetails?.winner1}</b>
                        </div>
                        <div>{eventDetails?.prize[0]["name"]}</div>
                      </div>
                    </div>
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                    <div className="brammam-event-card">
                      <div className="brammam-event-card-top flex-center">
                        <div className="brammam-event-card-title">
                          2 ம் இடம்
                        </div>
                        <div>
                          <img src={usedImages[1]} alt="" style={imageStyle} />
                        </div>
                      </div>
                      <div className="brammam-event-heading1 flex-center">
                        <div>
                          <b>{eventDetails?.winner2}</b>
                        </div>
                        <div>{eventDetails?.prize[1]["name"]}</div>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </Container>
            </>
          )}
          <div style={{ marginTop: "60px" }}></div>
        </Container>
      </>
    );
  } else {
    return <ComingSoon />;
  }
};

export default BrammamEventAbout;
