import React from "react";
import { Helmet } from "react-helmet";
import VaniVillaIntro from "../Components/events/vani-villa/intro/VanivillaIntro";
import VaniVillaGallery from "../Components/events/vani-villa/gallery/VanivillaGallery";

function VaniVilla() {
  return (
    <>
      <Helmet>
        <title>வாணி விழா  | தமிழ் இலக்கிய மன்றம்</title>
        <meta
          name="description"
          content="அந்திமாலைப் பொழுதிலே பல்கலைக்கழக வளாகத்தில் ஆரம்பமாகும் இவ் நிகழ்வு கல்விக்கு சரஸ்வதியும், செல்வத்திற்கு லஷ்மியும், வீரத்திற்கு துர்க்கையும் ஆகிய முப்பெரும் தேவிகளுக்கான இறை வழிபாட்டுடன் ஆரம்பமாகி இசை, நடனம், வில்லுப்பாட்டு, பல்லியம் போன்ற கலை நிகழ்ச்சிகளுடன் இரவுப்பொழுதினிலே இனிதே நிறைவேறும்"
        />
        <meta
          name="keywords"
          content="TLA, Tamil Literary Association, Vani Villa"
        />
      </Helmet>
      <VaniVillaIntro/>
      <VaniVillaGallery/>
    </>
  );
}

export default VaniVilla;
