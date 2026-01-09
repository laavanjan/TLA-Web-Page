import React from "react";
import { Helmet } from "react-helmet";
import JeevanathiIntro from "../Components/events/jeevanathi/intro/Jeevanathiintro";
import hand from "../images/Events/jeevanathi/people-hands-bringing-money-together-to-donate-to-charity 1.png";
import PastProject from "../Components/events/jeevanathi/helps/PastProject";
import PopupCard from "../Components/events/jeevanathi/popup/PopupCard";
function Jeevanathi() {
  return (
    <>
      <Helmet>
        <title>ஜீவநதி | தமிழ் இலக்கிய மன்றம்</title>
        <meta name="description" content="" />
        <meta name="keywords" content="TLA, Tamil Literary Association, jeevanathi" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <div style={{ position: 'relative' }}>
        <JeevanathiIntro />
        <div style={{ position: 'relative' }}>
          <img
            src={hand}
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: '0 auto',
              objectFit: 'cover',
              width: '100%'
            }}
          />
          <PopupCard
            buttonText="எம்முடன் இணையுங்கள்"
            content={[
              "வங்கி கணக்கு விபரம்",
              "Account Name : Tamil Literary Association",
              "Account Number : 320654",
              "Bank Name : Bank of Ceylon",
              "Branch Name : Kattubeda Branch",
              "",
              "தொடர்புகளுக்கு",
              "Kisanth - 077 591 4008",
              "Keethasaba - 076 263 7656"
            ]}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <PastProject />
        </div>
      </div>
    </>
  );
}

export default Jeevanathi;
