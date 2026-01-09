import React from "react";
import "./winnersList.css";
import { Container } from "@mui/material";
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import LooksOneIcon from '@mui/icons-material/LooksOne';

const Winners = ({ winning_schools }) => {
 console.log(Object.keys(winning_schools));
  return (
    <React.Fragment>
      <div className="set-width winners-conatainer">
        {winning_schools && Object.keys(winning_schools).length > 0 &&
          <Container maxWidth="" className="sotkanai-landing-containerx"> {/* Adjust maxWidth to "sm" for smaller container */}
            <div className="head-landing-containerx">
              <div className="head-landing-heading2x">வெற்றிபெற்ற பாடசாலைகள்</div>
              <div className="head-landing-body1x">
                {Object.keys(winning_schools).map((place, index) => (
                  <div className="head-landing-des1x" key={index}>
                    {place === "2nd_place" && true}
                    {place === "1st_place" && true}
                    {place === "3rd_place" && true}
                    <div className="head-landing-des2x">{winning_schools[place]}</div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        }
      </div>
    </React.Fragment>
  );
};

export default Winners;
