import React, { useState, useEffect } from "react";
import {
    Grid, Container
} from '@mui/material'
import './landing.css'
import { useHomeWallpapers } from "../../../shared/wallpapers";
import Img from '../../../images/LandingPage/V01.png'
const SLIDE_MS = 5000;

function Landing() {

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      // Set a timeout to add the fade-in-active class after a short delay
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100); // Adjust the delay as needed
      return () => clearTimeout(timer); // Cleanup on component unmount
    }, []);

    // Admin-managed wallpapers (/admin/wallpapers). None: the original layout.
    // One: shown still. Two or more: they slide across, round and round.
    const wallpapers = useHomeWallpapers(); // [{ url, text, color, tint }]
    const count = wallpapers.length;
    const [slide, setSlide] = useState({ tick: 0, cur: 0, prev: null });

    useEffect(() => {
        setSlide({ tick: 0, cur: 0, prev: null });
        if (count < 2) return undefined;
        wallpapers.forEach((w) => { new Image().src = w.url; });
        const timer = setInterval(() => {
            if (document.visibilityState === "hidden") return;
            setSlide((s) => ({ tick: s.tick + 1, prev: s.cur, cur: (s.cur + 1) % count }));
        }, SLIDE_MS);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallpapers.map((w) => w.url).join("|")]);

    // text: null = the built-in verse, "" = no heading, anything else = the admin's text.
    const heading = (w) => {
        if (w.text === "") return null;
        return w.text === null ? (
            <div className="landing-heading1" style={{ color: w.color }}><span className="landing-heading-letter">தி</span>த்திக்கும் தமிழில் நித்திலம் சொரிய
                எத்திக்கும் அதிர்ந்திட சங்கே முழங்கு!</div>
        ) : (
            <div className="landing-heading1 landing-heading-custom" style={{ color: w.color }}>{w.text}</div>
        );
    };

    const layer = (index, state) => {
        const w = wallpapers[index];
        return (
            <div
                key={state.tick + (index === slide.cur ? 0 : -1)}
                className={"landing-slide " + (index === slide.cur ? (state.prev === null ? "is-still" : "is-in") : "is-out")}
                style={{ backgroundImage: `url("${w.url}")`, backgroundPosition: w.focus ? `${w.focus.x}% ${w.focus.y}%` : "50% 50%" }}
            >
                {w.tint && <div className="landing-tint" style={{ background: w.tint.color, opacity: w.tint.opacity }} />}
                <Container maxWidth='' className="landing-slide-content">
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        <Grid item sm='6'>{heading(w)}</Grid>
                    </Grid>
                </Container>
            </div>
        );
    };

    return (
        <div className={"landing-container-div" + (count ? " has-wallpaper" : "")} id="landing">
            {count > 0 && (
                <div className="landing-slides">
                    {slide.prev !== null && slide.prev < count && slide.prev !== slide.cur && layer(slide.prev, slide)}
                    {slide.cur < count && layer(slide.cur, slide)}
                </div>
            )}
            {count > 1 && (
                <div className="landing-dots" aria-hidden="true">
                    {wallpapers.map((w, i) => <i key={w.url + i} className={i === slide.cur ? "is-on" : ""} />)}
                </div>
            )}
            {count === 0 && <Container maxWidth='' className="landing-container">
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
            </Container>}
        </div>
    );
}

export default Landing