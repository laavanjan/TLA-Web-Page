import React from "react";
import { Grid, Container } from "@mui/material";
import { Link } from "react-router-dom";
import "./BrammamIntro.css";

import eluthoviyamImg from "./images/eluthoviyam.png";
import meerigaiImg from "./images/meerigai.png";
import oliSuvaduImg from "./images/oli_suvadu.png";
import solalvarImg from "./images/solvalar.png";

const BrammamIntro = () => {
  const events = [
    {
      title: "எழுத்தோவியம்",
      descriiption:
        "தமிழ் மாணவர்களது சிந்தனையாக்க திறனை வெளிக்கொணர தமிழ் இலக்கிய மன்றத்தினால் நடத்தப்படும் எழுத்தாக்கப் போட்டியே எழுத்தோவியம் ஆகும் ",
      img: eluthoviyamImg,
      link: "eluthoviyam",
    },
    {
      title: "ஒளிச்சுவடு",
      descriiption:
        "தமிழ் மாணவர்களது புகைப்பட ஆற்றலை வெளிக்கொணர தமிழ் இலக்கிய மன்றத்தினால் நடத்தப்படும் போட்டியே சொல்வலர் ஆகும்",
      img: oliSuvaduImg,
      link: "olisuvadu",
    },
    {
      title: "மீரிகை",
      descriiption:
        "தமிழ் சமூகத்தின்  கலையாக்க திறனை வெளிக்கொணர தமிழ் இலக்கிய மன்றத்தினால் நடத்தப்படும் எண்ணிமச்சித்திர போட்டியே மீரிகை  ஆகும்",
      img: meerigaiImg,
      link: "meerigai",
    },
    {
      title: "சொலல்வலர் ",
      descriiption:
        "தமிழ் சமூகத்தின்  பேச்சாற்றல்  திறனை வெளிக்கொணர தமிழ் இலக்கிய மன்றத்தினால் நடத்தப்படும்  போட்டியே சொல்வலர் ஆகும் ",
      img: solalvarImg,
      link: "solalvalar",
    },
  ];
  return (
    <>
      <div
        className="brammam-landing-container-div"
        style={{ height: "fit-content" }}
      >
        <Container maxWidth="">
          <div className="event-landing-heading1">பிரம்மம்</div>
          {/* <div className="pongal-landing-heading1"><span className="pongal-landing-heading-letter">பி</span>ரம்மம்</div> */}
        </Container>
        <Container maxWidth="xl" className="event-container" sx={{ pb: 4 }}>
          <Grid
            container
            spacing={4}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            {events.map((event, index) => (
              <Grid item xl={3} lg={3} md={3} sm={12} xs={12} key={index}>
                <Link to={event.link}>
                  <div className="brammam-event-card">
                    <div className="brammam-event-card-top">
                      <div className="brammam-event-card-title">
                        {" "}
                        
                        {event.title}
                      </div>
                      
                      <div>
                        <img
                          src={event.img}
                          alt=""
                          style={{
                            height: "100px",
                            paddingTop: "30px",
                            filter: "grayscale(100%)",
                          }}
                        />
                      </div>
                    </div>
                    <div className="brammam-event-heading1">
                      {event.descriiption}
                    </div>
                  </div>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>
    </>
  );
};

export default BrammamIntro;
