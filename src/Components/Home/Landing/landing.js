import React, { useState, useEffect } from "react";
import {
    Grid, Container
} from '@mui/material'
import './landing.css'
import Img from '../../../images/LandingPage/V01.png'
function Landing() {

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      // Set a timeout to add the fade-in-active class after a short delay
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100); // Adjust the delay as needed
      return () => clearTimeout(timer); // Cleanup on component unmount
    }, []);

    return (
        <div className="landing-container-div" id="landing">
            <Container maxWidth='' className="landing-container">
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Grid item sm='6'>
                        <div className="landing-heading1"><span className="landing-heading-letter">தி</span>த்திக்கும் தமிழில் நித்திலம் சொரிய
                            எத்திக்கும் அதிர்ந்திட சங்கே முழங்கு!</div>
                    </Grid>
                    <Grid
                        container item sm='6'
                        className={isLoaded ? "fade-in fade-in-active" : "fade-in"}
                    >
                        <img src={Img} alt='' className="landing-img" />
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}

export default Landing