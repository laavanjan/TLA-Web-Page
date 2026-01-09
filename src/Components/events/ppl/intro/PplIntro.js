import React from "react";
import {carnival} from "../../../../shared/EventDetails";
import Intro from "../../../../shared/intro/Intro";

function PplIntro() {
    return (
        <Intro event={carnival[0]} />
    )
}

export default PplIntro;
