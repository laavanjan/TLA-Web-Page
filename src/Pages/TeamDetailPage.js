import React from "react";
import Seo from "../seo/Seo";
import { Navigate, useParams } from "react-router-dom";
import TeamDetail from "../Components/teams/team-detail/TeamDetail";
import { useTeamPages } from "../shared/teamPages";

function TeamDetailPage() {
  const { teamId } = useParams();
  const pages = useTeamPages();
  const page = pages.find((p) => String(p.id) === teamId);

  // A team an admin has hidden is not public: back to the Teams list.
  if (page && page.hidden) return <Navigate to="/teams" replace />;

  return (
    <>
      <Seo
        title={page ? page.title : "அணி"}
        description={page ? `${page.title} — ${page.tagline}. தமிழ் இலக்கிய மன்றம், மொறட்டுவைப் பல்கலைக்கழகம்.` : "அணி விபரங்கள்"}
        path={`/teams/${teamId}`}
        image={page && /^https?:\/\//.test(page.logo || "") ? page.logo : undefined}
      />
      <TeamDetail page={page} />
    </>
  );
}

export default TeamDetailPage;
