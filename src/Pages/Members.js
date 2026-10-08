import React from "react";
import { Helmet } from "react-helmet";
import Members from "../Components/members/Members";

function MembersPage() {
  return (
    <>
      <Helmet>
        <title>உறுப்பினர்கள் | தமிழ் இலக்கிய மன்றம்</title>
        <meta name="description" content="தமிழ் இலக்கிய மன்ற உறுப்பினர்கள்" />
      </Helmet>
      <Members />
    </>
  );
}

export default MembersPage;
