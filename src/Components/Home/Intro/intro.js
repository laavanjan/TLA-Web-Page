import React from "react";
import {
    Grid, Container, Box
} from '@mui/material'
import Heading from "../../../shared/Heading";
import './intro.css'
import ReactPlayer from 'react-player'

function Intro() {
    return (
        <div className="intro-container-div" id="intro">
            <Container maxWidth='xl' className="intro-container" sx={{ pb: 2 }}>
                <Heading>அறிமுகம்</Heading>
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
                            {/* <div className="intro-heading1">மொறட்டுவை தமிழ் இலக்கியமன்றமானது தமிழ் மாணாக்கர் தம் ஆளுமை விருத்தி மற்றும் தமிழ் மக்கள் சார் வளர்ச்சிக்காக அயராது உதவிக் கரங்களை நீட்டும் ஒரு பல்கலைகழக குழுமமாகும் . இலங்கையின் பிரம்மாண்டமான விவாதப் போட்டியான சொற்கணையை இலங்கையின் 25 மாவட்டங்களிலும் நடாத்தும் ஒரே ஒரு தமிழ் குழுமமாக இருப்பது சிறப்பம்சம் ! தமிழ் செல் அரித்துப்போய் முடமாகிய பகுதிகளில் கூட தமிழ் சொல்லால் சொற்கணை கொண்டு தமிழை வாழவைத்த தடயங்கள் இன்று பதிவுகளாக ! நாளை வரலாறுகளாக ! கல்வியா? பொருளா? இன்னோரென்ன உதவிகளா? "நாங்கள் இருக்கிறோம்" என்று வெள்ளம் , மற்றும் நில அதிர்வின் போது தோள் கொடுத்திருக்கிறார்கள் நம் மாணவ நெஞ்சங்கள். நாடு போற்றும் தமிழ் விழாவாம் தமிழருவி தொழில்னுட்பம் அழகு சேர்க்க வருடா வருடம் அரங்கேறுகிறது.</div> */}
                            <div className="intro-heading1">இலத்திரனியல் யுகத்தில் இலக்கியம் காக்க
                                மொறட்டுவை தமிழ் மாணக்கரின் முயற்சியில்
                                இயங்கிடும் மன்றமொன்று
                                தலைநகரில் தமிழ் சிறக்க
                                முத்தமிழ் முரசு கொட்ட
                                தமிழருவி அரங்கேற்றமும்
                                பள்ளி மாணவரிடையே இலங்கையெங்கும் விவாதச்சமராய் சொற்கணையும்
                                தமிழர் இடர்கலைய தாராள உள்ளங்களோடு உதவிக்கரம் கொடுக்கும் மாணக்கர் குழுமமிது</div>
                        </Container>
                    </Grid>
                    <Grid item sm='5'>
                        <br /><br />
                        <div className="intro-heading2">தமிழுக்காய் நாம் ! நமக்கேயான தமிழ் !!</div>
                        <p className="intro-heading2"></p>

                    </Grid>

                </Grid>
                {/* <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ReactPlayer url='https://fb.watch/hQ_elvyOkd/' />
                </Box> */}
            </Container>
        </div>
    );
}

export default Intro