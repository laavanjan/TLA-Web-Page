import React from "react";
import { Helmet } from "react-helmet";
import Teams from "../Components/teams/Teams";

function TeamsPage() {
  return (
    <>
      <Helmet>
        <title>அணிகள் | தமிழ் இலக்கிய மன்றம்</title>
        <meta
          name="description"
          content="அணிகள்"
        />
        <meta
          name="keywords"
          content="TLA, Tamil Literary Association, Teams"
        />
      </Helmet>
      <Teams/>
    </>
  );
}

export default TeamsPage;