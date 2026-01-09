import React from "react";
import { cultureEvent } from "../../../../shared/EventDetails";
import Intro from "../../../../shared/intro/Intro";

function VaniVillaIntro() {
    return (
       <Intro event={cultureEvent[1]} /> 
    );
}

export default VaniVillaIntro