import React from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../../shared/Heading";
import ImageGallery from "../../../../shared/imageGallery/ImageGallery";
import './foodGallery.css'

function srcset(image, size, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows
            }&fit=crop&auto=format&dpr=2 2x`,
    };
}

const images = [
    {
        img: "https://live.staticflickr.com/65535/52606586515_60c4bb0604_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606586515_0632e1b352_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/52606422409_c381d93e2d_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606422409_8599e04626_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/52606668793_697efab0a6_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606668793_cf09949085_w.jpg',
    },
    {
        img: 'https://live.staticflickr.com/65535/52606422549_f8c59bac2b_o.jpg',
        thumbnail: 'https://live.staticflickr.com/65535/52606422549_f571a4b03d_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/52606166211_c84bb1ed45_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606166211_1fa353177d_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/52606586720_0958ec7b8b_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606586720_39e3ecdde3_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/52606586710_25fd620e61_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606586710_7d732ab053_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/52606166236_c1199938f2_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606166236_ed9c5d3e8f_w.jpg',
    },
]




function FoodGallery() {
    return (
        <div className="gallery-container-div">
            <Container maxWidth='lg' className="gallery-container">
                <Heading >கலை காட்சி கூடம்</Heading>
                <ImageGallery images={images} />
            </Container>
        </div>
    );
}

export default FoodGallery