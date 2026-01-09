import React from "react";
import {
    Grid, Container, ImageList, ImageListItem
} from '@mui/material';
import './pplteams.css';
import Heading from "../../../../shared/Heading";

const pplTeamImages = [
    {
        img: "https://live.staticflickr.com/65535/53529394853_f4b5dd313e_w.jpg",
        thumbnail: "https://live.staticflickr.com/65535/53529394853_f4b5dd313e_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53529210076_0d84cc3e63_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53529210076_0d84cc3e63_w.jpg"
    },
    {
        img: "https://live.staticflickr.com/65535/53529640430_0b6c574422_w.jpg",
        thumbnail: "https://live.staticflickr.com/65535/53529640430_0b6c574422_w.jpg"
    },
    {
        img: "https://live.staticflickr.com/65535/53529210106_854f5020b6_w.jpg",
        thumbnail: "https://live.staticflickr.com/65535/53529210106_854f5020b6_w.jpg"
    },
    {
        img: "https://live.staticflickr.com/65535/53529525849_2bbbaac9b5_w.jpg",
        thumbnail: "https://live.staticflickr.com/65535/53529525849_2bbbaac9b5_w.jpg"
    },
    {
        img: "https://live.staticflickr.com/65535/53529640495_885558d677_w.jpg",
        thumbnail: "https://live.staticflickr.com/65535/53529640495_885558d677_w.jpg"
    }
];

function PplTeams() {
    return (
            <div className='ppl-team-container-div'>
                <Container>
                    <Heading>அணி விபரங்கள்</Heading>
                    <Grid container spacing={3}>
                        {pplTeamImages.map((image, index) => (
                            <Grid item xs={12} sm={6} md={6} lg={6} xl={6} key={index} className='ppl-team-grid-container'>
                                <img src={image.img} alt={`Image ${index}`} className='ppl-team-images' />
                            </Grid>
                        ))}
                    </Grid>
                </Container>

            </div>
    )
}

export default PplTeams;
