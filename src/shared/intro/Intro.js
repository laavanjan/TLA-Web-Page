import React from "react";
import {
    Grid, Container
} from '@mui/material';
import './intro.css';

function Intro(propos) {
    const event = propos.event;
    return (
        <>
             <div className="event-landing-container-div">
                <Container maxWidth='' className="event-landing-container">
                    <div className="event-landing-heading1">{event.title}</div>
                    <img src={event.img} alt="event" className="event-icon" />
                    <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                    > 
                        <Grid item sm='12'>
                            <Container maxWidth="md">
                                <div className="event-intro-decription">{event.descriiption}</div>
                            </Container>
                        </Grid>
                    </Grid>
                </Container>
            </div>
        </>
    );
}

export default Intro