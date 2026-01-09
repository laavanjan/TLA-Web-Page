import React from "react";
import "./winnersList.css";
import { Container } from "@mui/material";
import Gold from '../../../../images/Sotkanai/gold.png';
import silver from '../../../../images/Sotkanai/silver.png';
import bronz from '../../../../images/Sotkanai/bronz.png';
import Cham from '../../../../images/Sotkanai/Cham.png';


const Winners2024 = () => {
  return (
    <React.Fragment>
      <div className="set-width winners-conatainer">
          <Container maxWidth="" className="sotkanai-landing-containerx">
            <div className="head-landing-containerx">
              <div className="head-landing-heading2x">சொற்கணை 2024</div>
              <div className="head-landing-body1x">
              <div className="medals-section">
        <div className="medal silver-place">
          <img
            src={silver} // Replace with actual silver medal icon
            alt="Silver Medal"
            className="medal-img"
          />
          <p>யாழ் / இந்துக் கல்லூரி</p>
        </div>

        <div className="medal gold-place">
          <img
            src={Gold}
            alt="Gold Medal"
            className="medal-img "
          />
          <p>கிளி / அன் திரேசா பெண்கள் பாடசாலை</p>
        </div>

        <div className="medal bronze-place">
          <img
            src={bronz} 
            alt="Bronze Medal"
            className="medal-img"
          />
          <p>வவுனியா தமிழ் மகா வித்தியாலயம்</p>
        </div>
      </div>

      <div className="trophy-section">
      <div className="head-landing-heading2x">சிறந்த விவாதி</div>

        <img
          src={Cham}
          alt="Trophy"
          className="trophy-img"
        />
        <p> வைஷ்ணவி சிவாஸ்கரன்</p>
      </div>
              
              </div>
            </div>
          </Container>
       
      </div>
    </React.Fragment>
  );
};

export default Winners2024;
