import React from "react";
import {guidance} from "../../../../shared/EventDetails";
import Intro from "../../../../shared/intro/Intro";

function AramiyamIntro() {
  return (
      <Intro event={guidance[0]} />
  );
}

export default AramiyamIntro;
