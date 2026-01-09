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
        title: 'Platinum Sponsor',
        img: "https://live.staticflickr.com/65535/52613194496_2d3d39870c_o.png",
        descriiption: <p>Dear Designers and coders, <br /> we're expanding our family!<br /> Join at huex.<br /> <a className="link" href="mailto: careers@huex.io">careers@huex.io</a></p>
    },
    {
        title: 'Bronze Sponsor',
        img: "https://live.staticflickr.com/65535/52621520282_f2868feb7f_o.png",
        descriiption: <p>SenzAgro is a global real-time agricultural ecosystem intelligence platform created for 500 million smallholder farmers</p>
    },
    //     {
    //         title: 'அனுசரணையாளர்',
    //         img: img2,
    //         descriiption: 'Sponsor 2 details'
    //     },
    //     {
    //         title: 'அனுசரணையாளர்',
    //         img: img3,
    //         descriiption: 'Sponsor 3 details'
    //     },
]

const sponsorAds = [
    {
        original: 'https://live.staticflickr.com/65535/52613692573_bb70fd2a1d_o.png',
        thumbnail: 'https://live.staticflickr.com/65535/52613692573_965556921d_w.jpg',
    },
    {
        original: 'https://live.staticflickr.com/65535/52613626390_0a7b41282f_o.png',
        thumbnail: 'https://live.staticflickr.com/65535/52613626390_afc56b4476_w.jpg',
    },
]

function Sponsors() {
    return (
        <div className="sponsors-container-div">
            <Container maxWidth='lg' className="sponsors-container" sx={{ pb: 4 }}>
                <Heading>அனுசரணை வழங்குவோர்</Heading>
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