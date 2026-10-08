import React from "react";
import { Link } from "react-router-dom";
import { Container } from "@mui/material";
import Heading from "../../../shared/Heading";
import "./membersBanner.css";

function MembersBanner() {
  return (
    <section className="members-banner">
      <Container maxWidth="lg" className="members-banner-wrap">
        <Heading>எங்கள் உறுப்பினர்கள்</Heading>
        <div className="intro-heading1">எம்மோடு இணைந்து பயணிக்கும் உறவுகளை அறிந்து கொள்ளுங்கள்.</div>
        <Link to="/members" className="members-banner-btn">
          உறுப்பினர்களைப் பார்க்க
        </Link>
      </Container>
    </section>
  );
}

export default MembersBanner;
