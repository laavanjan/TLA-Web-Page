import React from "react";
import {
    Grid, Container
} from '@mui/material'
import './sponsors.css'
import Heading from "../../../../shared/Heading";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";

const sponsorsDetails = [
    {
        title: 'Bronze Sponsor',
        img: "https://a2zcleangimages.s3.amazonaws.com/TlaImages/JRide-logo-01-(1).png",
        descriiption: <p>JRide is the ultimate solution for hassle-free transportation in Sri Lanka. Our online taxi app offers a quick and easy way to book any kind of vehicle ride, from cars to tuk-tuks, to get you where you need to go.</p>
    }
]
function Sponsors() {
    return (
        <div className="sponsors-container-div">
            <Container maxWidth='lg' className="sponsors-container" sx={{ pb: 4 }}>
                <h2>அனுசரணை வழங்குவோர்</h2>
                <Grid
                    container
                    direction="row"
                    justifyContent="space-around"
                    alignItems="center"
                    spacing={4}
                >
                    {sponsorsDetails.map((sponsor, index) => <>

                        <Grid item xl='4' lg='4' md='4' sm='6' xs='12' key={index}  >
                            <div className="sponsors-card">
                                <div className="sponsors-card-top">
                                    <div className="sponsors-card-title"> {sponsor.title}</div>
                                    <div className="sponsors-img-cont">
                                        <img src={sponsor.img} alt="" className="sponsors-img" />
                                    </div>
                                </div>
                                <div className="sponsors-heading1">{sponsor.descriiption}</div>
                            </div>
                        </Grid>
                    </>
                    )}

                </Grid>
            </Container>
            {/* <ImageGallery autoPlay items={sponsorAds} /> */}
        </div>
    );
}

export default Sponsors