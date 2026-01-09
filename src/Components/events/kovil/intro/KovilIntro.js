import React from "react";
import {social} from "../../../../shared/EventDetails";
import Intro from "../../../../shared/intro/Intro";

function KovilIntro() {
    return (
        <Intro event={social[1]} />
    );
}

export default KovilIntro