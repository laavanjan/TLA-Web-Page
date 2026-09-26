import React from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import TeamDetail from "../Components/teams/team-detail/TeamDetail";
import { useTeamPages } from "../shared/teamPages";

function TeamDetailPage() {
  const { teamId } = useParams();
  const pages = useTeamPages();
  const page = pages.find((p) => String(p.id) === teamId);

  return (
    <>
      <Helmet>
        <title>
          {page ? `${page.title} | தமிழ் இலக்கிய மன்றம்` : "அணி | தமிழ் இலக்கிய மன்றம்"}
        </title>
        <meta name="description" content={page ? page.tagline : "அணி விபரங்கள்"} />
        <meta name="keywords" content="TLA, Tamil Literary Association, Team" />
      </Helmet>
      <TeamDetail page={page} />
    </>
  );
}

export default TeamDetailPage;
