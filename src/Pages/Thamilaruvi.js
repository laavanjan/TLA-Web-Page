import React from "react";
import { Helmet } from "react-helmet";
import ThamilaruviIntro from "../Components/events/thamilaruvi/intro/thamilaruviIntro";
import ThamilaruviGallery from "../Components/events/thamilaruvi/gallery/ThamilaruviGallery";
import Agenda from "../Components/events/thamilaruvi/agenda/Agenda";

function Thamilaruvi() {
  return (
    <>
      <Helmet>
        <title>தமிழருவி  | தமிழ் இலக்கிய மன்றம்</title>
        <meta
          name="description"
          content="தமிழ் சமூகத்தின் மிகப்பெரிய பேறுகளான கலை கல்வி மற்றும் கலாச்சாரம் ஆகியவற்றின் இன்றைய விருத்திக்கும் நாளைய இருப்பிற்கும் தூணாய் நிற்க முனையும் எம் மொறட்டுவை பல்கலைக்கழக தமிழ் மன்றம் வருடந்தோறும் தலைநகரில் இலட்சக்கணக்கானோர் முன்னிலையில் பிரமாண்டத்தின் உச்சமாக நடைபெறும் கலை நிகழ்வு தமிழருவி ஆகும்."
        />
        <meta
          name="keywords"
          content="TLA, Tamil Literary Association, Thamilaruvi"
        />
      </Helmet>
      <ThamilaruviIntro />
      <Agenda />
      <ThamilaruviGallery />
    </>
  );
}

export default Thamilaruvi;
