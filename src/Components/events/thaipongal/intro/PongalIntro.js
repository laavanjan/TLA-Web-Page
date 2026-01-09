import React from "react";
import {
    Grid, Container
} from '@mui/material';
import './pongalintro.css';
import {cultureEvent} from "../../../../shared/EventDetails";
import Intro from "../../../../shared/intro/Intro";

function PongalIntro() {
    return (
        <Intro event={cultureEvent[0]} />
    );
}

export default PongalIntro