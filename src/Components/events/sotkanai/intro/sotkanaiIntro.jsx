import React from "react";
import {competition} from "../../../../shared/EventDetails";
import Intro from "../../../../shared/intro/Intro";

function SotkanaiIntro() {
    return (
        <Intro event={competition[0]} />
    );
}

export default SotkanaiIntro;