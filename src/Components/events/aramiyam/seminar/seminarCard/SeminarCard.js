import React from "react";
import "./seminarcard.css";
import youtubeImg from "../../../../../images/Events/aramiyam/Youtube.png";
import profileImg01 from "../../../../../images/Events/aramiyam/profile01.png";
import {
  Container,
  Grid,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { Gif } from "@mui/icons-material";

const theme = createTheme({
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "Para",
          marginInline: 5,
          color: "#002345e3",
        },
      },
      variants: [
        {
          props: { variant: "h5" },
          style: {
            // width: "30%",
            fontSize: "1.5rem",

            textAlign: "center",
            // letterSpacing: "0.5rem",
            "@media (max-width: 768px)": {
              fontSize: "1.3rem",
            },
          },
        },
        {
          props: { variant: "h6" },
          style: {
            fontSize: "1rem",
            color: "#002345e3",
            textAlign: "center",
            "@media (max-width: 768px)": {
              fontSize: "0.9rem",
            },
          },
        },
        {
          props: { variant: "h4" },
          style: {
            fontSize: "2.5rem",
            fontWeight: "400",
            // fontFamily: "H",
            color: "#002345e3",
            textAlign: "left",
            "@media (max-width: 768px)": {
              fontSize: "1.8rem",
            },
          },
        },
        {
          props: { variant: "body1" },
          style: {
            fontSize: "1.5rem",
            fontWeight: "400",
            width: "fit-content",
            marginTop: 5,
            // fontFamily: "H",
            color: "#002345e3",
            textAlign: "left",
            "@media (max-width: 768px)": {
              fontSize: "1.3rem",
            },
          },
        },
      ],
    },
  },
});

function SeminarCard({ SeminarData }) {
  return (
    <ThemeProvider theme={theme}>
      <div className="frame seminarCard">
        {/* <div className="frame seminar-heading">
          கருத்தரங்கு {SeminarData.id}
        </div> */}
        <Grid display={"flex"} flexDirection={"row"} container spacing={2}>
          <Grid
            direction={"column"}
            item
            md={4}
            xs={12}
            className="profile-frame"
          >
            <img className="profile-img" src={SeminarData.speaker.profileImg != '' ? SeminarData.speaker.profileImg :profileImg01} />
            <Grid
              display={"flex"}
              flexDirection={{ xs: "column", md: "row" }}
              justifyContent={"center"}
              alignItems={"center"}
              marginTop={3}
            >
              {/* <Typography variant="h5">பெயர்: </Typography> */}
              <Typography variant="h6">{SeminarData.speaker.name}</Typography>
            </Grid>
            <Grid display={"flex"} flexDirection={"column"}>
              {/* <Typography variant="h5">பதவி :</Typography> */}
              <Typography variant="h6">
                {SeminarData.speaker.position}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"flex-start"}
            alignItems={{ xs: "center", md: "flex-start" }}
            item
            md={8}
            xs={12}
          >
            <Grid
              display={"flex"}
              justifyContent={"flex-start"}
              flexDirection={"column"}
              alignItems={{ xs: "center", md: "flex-start" }}
              marginTop={{ xs: 1, md: 3 }}
            >
              <Typography variant="h4">{SeminarData.title}</Typography>
              <Grid sx={{ width: { xs: "100%", md: "80%" }, marginTop: 3 }}>
                <Typography variant="body1">
                  {SeminarData.description}
                </Typography>
              </Grid>
            </Grid>
            <Grid
              display={"flex"}
              flexDirection={{ xs: "column", md: "row" }}
              justifyContent={"flex-start"}
              alignItems={"center"}
              marginTop={{ xs: 3, md: 8 }}
              container
              sx={{ width: "60%", height: "50%" }}
            >
              <Grid
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                item
                md={6}
                xs={12}
              >
                <Typography
                  variant="body1"
                  // className="time-content time-heading"
                >
                  நேரம்
                </Typography>
                <Typography variant="body1">{SeminarData.time}</Typography>
              </Grid>
              <Grid
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                item
                height={20}
                md={6}
                xs={12}
              >
                <Typography variant="body1">திகதி</Typography>
                <Typography variant="body1">{SeminarData.date}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          alignSelf={{ xs: "center", md: "flex-end" }}
          marginRight={{ xs: 0, md: 15 }}
        >
          <a href={SeminarData.youtubeLink} target="_blank" className="video-link">
            {/* {" "} */}
            {/* <img src={youtubeImg} alt="YouTube Video Preview" /> */}
            காணொளி
          </a>
        </Grid>
      </div>
    </ThemeProvider>
  );
}

export default SeminarCard;
