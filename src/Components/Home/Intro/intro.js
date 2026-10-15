import React, { useRef } from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../shared/Heading";
import FxHeading from "../FxHeading";
import Kolam from "./Kolam";
import { useScrollVar, useInView, rangeProgress } from "../../../shared/scrollFx/scrollFx";
import './intro.css'

// An earlier, longer introduction, kept for reference:
// மொறட்டுவை தமிழ் இலக்கியமன்றமானது தமிழ் மாணாக்கர் தம் ஆளுமை விருத்தி மற்றும் தமிழ் மக்கள் சார் வளர்ச்சிக்காக அயராது உதவிக் கரங்களை நீட்டும் ஒரு பல்கலைகழக குழுமமாகும் . இலங்கையின் பிரம்மாண்டமான விவாதப் போட்டியான சொற்கணையை இலங்கையின் 25 மாவட்டங்களிலும் நடாத்தும் ஒரே ஒரு தமிழ் குழுமமாக இருப்பது சிறப்பம்சம் ! தமிழ் செல் அரித்துப்போய் முடமாகிய பகுதிகளில் கூட தமிழ் சொல்லால் சொற்கணை கொண்டு தமிழை வாழவைத்த தடயங்கள் இன்று பதிவுகளாக ! நாளை வரலாறுகளாக ! கல்வியா? பொருளா? இன்னோரென்ன உதவிகளா? "நாங்கள் இருக்கிறோம்" என்று வெள்ளம் , மற்றும் நில அதிர்வின் போது தோள் கொடுத்திருக்கிறார்கள் நம் மாணவ நெஞ்சங்கள். நாடு போற்றும் தமிழ் விழாவாம் தமிழருவி தொழில்னுட்பம் அழகு சேர்க்க வருடா வருடம் அரங்கேறுகிறது.

const VERSE = `இலத்திரனியல் யுகத்தில் இலக்கியம் காக்க
    மொறட்டுவை தமிழ் மாணக்கரின் முயற்சியில்
    இயங்கிடும் மன்றமொன்று
    தலைநகரில் தமிழ் சிறக்க
    முத்தமிழ் முரசு கொட்ட
    தமிழருவி அரங்கேற்றமும்
    பள்ளி மாணவரிடையே இலங்கையெங்கும் விவாதச்சமராய் சொற்கணையும்
    தமிழர் இடர்கலைய தாராள உள்ளங்களோடு உதவிக்கரம் கொடுக்கும் மாணக்கர் குழுமமிது`;

const WORDS = VERSE.split(/\s+/).filter(Boolean);

// Scroll effects (homeFx.css): the kolams on either side draw themselves as the
// section comes up (--k), and the verse lights up word by word as it passes
// through the middle of the screen (--p).
const kolamProgress = rangeProgress("top", 1, 0.05);
const verseProgress = rangeProgress("center", 0.92, 0.42);

function Intro() {
    const sectionRef = useRef(null);
    const verseRef = useRef(null);
    const taglineRef = useRef(null);
    useScrollVar(sectionRef, kolamProgress, { name: "--k" });
    useScrollVar(verseRef, verseProgress, { name: "--p" });
    const taglineIn = useInView(taglineRef, { threshold: 0.6 });

    return (
        <div ref={sectionRef} className="intro-container-div fx-intro" id="intro">
            <Kolam className="is-left" />
            <Kolam className="is-right" />
            <Container maxWidth='xl' className="intro-container" sx={{ pb: 2 }}>
                <FxHeading>
                    <Heading>அறிமுகம்</Heading>
                </FxHeading>
                <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Grid item sm='1' >

                    </Grid>
                    <Grid item sm='12'>
                        <div style={{ height: '5vh' }}></div>
                        <Container maxWidth="md">
                            <div
                                ref={verseRef}
                                className="intro-heading1 fx-verse"
                                style={{ "--n": WORDS.length + 4 }}
                            >
                                {WORDS.map((word, i) => (
                                    <React.Fragment key={i}>
                                        <span className="fx-word" style={{ "--i": i }}>{word}</span>{" "}
                                    </React.Fragment>
                                ))}
                            </div>
                        </Container>
                    </Grid>
                    <Grid item sm='5'>
                        <br /><br />
                        <div ref={taglineRef} className={`intro-heading2 fx-tagline ${taglineIn ? "is-in" : ""}`}>
                            <span className="fx-tagline-part">தமிழுக்காய் நாம் !</span>{" "}
                            <span className="fx-tagline-part">நமக்கேயான தமிழ் !!</span>
                            <svg className="fx-brush" viewBox="0 0 600 24" preserveAspectRatio="none" aria-hidden="true">
                                <path d="M6,16 C120,4 230,20 330,11 C420,3 520,14 594,8" pathLength="1" />
                            </svg>
                        </div>
                    </Grid>

                </Grid>
            </Container>
        </div>
    );
}

export default Intro
