import React from "react";
import { competition } from "../../../../shared/EventDetails";
import Intro from "../../../../shared/intro/Intro";

function HackIntro() {
    return (
        <>
            <Intro event={competition[1]} />
        </>
    );
}

export default HackIntro