import React from "react";
import {carnival} from "../../../../shared/EventDetails";
import Intro from "../../../../shared/intro/Intro";

function MovieIntro() {
    return (
        <Intro event={carnival[1]} />
    );
}

export default MovieIntro