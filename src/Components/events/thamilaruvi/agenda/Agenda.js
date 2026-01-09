import React from "react";
import { Grid, Container } from "@mui/material";
import "./agenda.css";
import Heading from "../../../../shared/Heading";

function Agenda() {
    const events = [
        "மங்கல விளக்கேற்றல்",
        "தமிழ்த்தாய் வாழ்த்து",
        "வரவேற்பு நடனம்",
        "தலைமை உரை",
        "பிரதம விருந்தினர் உரை",
        "இதழ் வெளியீடு",
        "பல்லியம்",
        "நாடகம்",
        "மெல்லிசை",
        "மக்கள் மன்றம்",
        "நடனம்",
        "நன்றியுரை"
    ];

    return (
        <div className="agenda-container-div">
            <Container
                maxWidth="lg"
                className="agenda-container"
                sx={{ pb: 4 }}
            >
                <Heading>நிகழ்ச்சி நிரல்</Heading>
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={0.001}
                    cols={2}
                >
                    <div className="event-container-1">
                        <p className="thamilaruvi-para1">
                            மொறட்டுவை பல்கலைக்கழக தமிழ் இலக்கிய மன்றம்
                            பெருமையுடன் வழங்கும்
                        </p>
                        <p className="invite-heading">தமிழருவி</p>
                        <p className="para2">
                            <p className="invite-detail">திகதி</p>
                            <p className="invite-sub-detail">13.10.2024</p>
                            <p className="invite-detail">நேரம்</p>
                            <p className="invite-sub-detail">மாலை 2.32</p>
                            <p className="invite-detail">இடம் </p>
                            <p className="invite-sub-detail">கொழும்பு இராமகிருஷ்ண மண்டபம்</p>
                        </p>
                    </div>
                    <div className="event-container-2">
                        <div className="thamilaruvi-events">
                            <p className="agenda-heading">நிகழ்ச்சி நிரல்</p>
                            {events.map((event, index) => (
                                <p key={index} className="event-list-text">{event}</p>
                            ))}
                        </div>
                    </div>
                    {/* <a data-flickr-embed="true" href="https://www.flickr.com/photos/197344750@N07/53518910764/in/dateposted-public/" title="425413360_683516067327222_3284843738300333850_n"><img src="https://live.staticflickr.com/65535/53518910764_6a927d8d93_b.jpg" width="768" height="960" alt="425413360_683516067327222_3284843738300333850_n"/></a><script async src="//embedr.flickr.com/assets/client-code.js" charset="utf-8"></script> */}
                </Grid>
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={0.001}
                    cols={2}
                >
                    <img className="invitation-img" src="https://live.staticflickr.com/65535/54057711577_ac451486b2_w.jpg" />
                    <img className="invitation-img" src="https://live.staticflickr.com/65535/54058586916_b9c4748ae4_w.jpg" />
                </Grid>
            </Container>
        </div>
    );
}

export default Agenda;
