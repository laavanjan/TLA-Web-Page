import React from "react";
import { Helmet } from "react-helmet";
import KovilIntro from "../Components/events/kovil/intro/KovilIntro";
import KovilGallery from "../Components/events/kovil/kovil-gallery/KovilGallery";

function Kovil() {
  return (
    <>
      <Helmet>
        <title>கோவில்  | தமிழ் இலக்கிய மன்றம்</title>
        <meta
          name="description"
          content="வருடந்தோறும் இரத்மலானையில் உள்ள திருநந்தீஸ்வர ஆலயத்தில் சிவராத்திரி , நவராத்திரி மற்றும் தைப்பொங்கல் பூசைகள் தமிழ் இலக்கிய மன்றத்தால் சிறப்பாக நடாத்தபட்டு வருகின்றன. இந்நேரங்களில் மாணவர்களின் இறைவழிபாடுகள் மற்றும் சிரமதான பணிகள் நடைபெறுகின்றன"
        />
        <meta
          name="keywords"
          content="TLA, Tamil Literary Association, Kovil"
        />
      </Helmet>
      <KovilIntro/>
      <KovilGallery/>
    </>
  );
}

export default Kovil;
