import React from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import TeamDetail from "../Components/teams/team-detail/TeamDetail";
import { TeamsData } from "../Components/teams/teamsData";

function TeamDetailPage() {
  const { teamId } = useParams();
  const team = TeamsData.find((t) => String(t.id) === teamId);

  return (
    <>
      <Helmet>
        <title>
          {team ? `${team.title} | தமிழ் இலக்கிய மன்றம்` : "அணி | தமிழ் இலக்கிய மன்றம்"}
        </title>
        <meta name="description" content={team ? team.tagline : "அணி விபரங்கள்"} />
        <meta name="keywords" content="TLA, Tamil Literary Association, Team" />
      </Helmet>
      <TeamDetail />
    </>
  );
}

export default TeamDetailPage;
