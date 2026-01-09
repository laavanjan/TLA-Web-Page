import { Movie } from "@mui/icons-material";
import React from "react";
import { Helmet } from "react-helmet";
import MovieNightIntro from "../Components/events/movie-night/intro/MovieIntro";
import MovieNightGallery from "../Components/events/movie-night/movie-gallery/MovieGallery";

function Kovil() {
  return (
    <>
      <Helmet>
        <title>திரைப்பட இரவு | தமிழ் இலக்கிய மன்றம்</title>
        <meta
          name="description"
          content="இயந்திரமாக ஓடி உடலாலும் மனதாலும் சோர்ந்து இருக்கும் மாணவர்களின் மனங்களை இதப்படுத்த பல்கலைக்கழக வளாகத்தில் நடைபெறும் திரைப்படங்களின் காட்சிகள்"
        />
        <meta
          name="keywords"
          content="TLA, Tamil Literary Association, Movie Night"
        />
      </Helmet>
      <MovieNightIntro/>
      <MovieNightGallery/>
    </>
  );
}

export default Kovil;
