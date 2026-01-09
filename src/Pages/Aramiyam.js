import React from "react";
import { Helmet } from "react-helmet";
import AramiyamIntro from "../Components/events/aramiyam/intro/Aramiyamintro";
import Seminar from "../Components/events/aramiyam/seminar/Seminar";

function Aramiyam() {
  return (
    <div
      style={{
        display: "-ms-flexbox",
        justifyContent: "center",
        alignItems: "flex-start",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title>அரமியம் | தமிழ் இலக்கிய மன்றம்</title>
        <meta
          name="description"
          content="“அரமியம்” என்பது தமிழ் இளைஞர்களின் தொழில் வழிகாட்டுதல் நிகழ்வாகும். இது இலங்கையின் அனைத்து மாவட்டங்களிலும் உள்ள பள்ளி மற்றும் கல்லூரி மாணவர்களுக்கு இலவசமாக வழங்கப்படுகிறது. இந்த நிகழ்வு மூலம், மாணவர்கள் தங்கள் திறன்கள் மற்றும் ஆர்வங்களை அடிப்படையாகக் கொண்டு தங்களுக்கான சிறந்த தொழில் வாய்ப்புகளைக் கண்டறிய உதவுகிறது."
        />
        <meta
          name="keywords"
          content="TLA, Tamil Literary Association, Aramiyam"
        />
      </Helmet>
      <AramiyamIntro />
      <Seminar />
    </div>
  );
}

export default Aramiyam;
