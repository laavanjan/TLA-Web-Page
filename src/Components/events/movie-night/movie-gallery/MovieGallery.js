import React from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../../shared/Heading";
import ImageGallery from "../../../../shared/imageGallery/ImageGallery";
import './movieGallery.css'

function srcset(image, size, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows
            }&fit=crop&auto=format&dpr=2 2x`,
    };
}

const images = [
    {
        img:"https://live.staticflickr.com/65535/53565962650_e1b3735de8.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53565962650_e1b3735de8.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53564671772_c2f42bc0c1_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53564671772_c2f42bc0c1_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53565845054_7f2ee8c414_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53565845054_7f2ee8c414_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53564671777_f8d2c97158.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53564671777_f8d2c97158.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53564671812_781987b2de_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53564671812_781987b2de_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53565845104_5816395b41_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53565845104_5816395b41_w.jpg"
    }
]




function MovieGallery() {
    return (
        <div className="gallery-container-div">
            <Container maxWidth='lg' className="gallery-container">
                <Heading >கலை காட்சி கூடம்</Heading>
                <ImageGallery images={images} />
            </Container>
        </div>
    );
}

export default MovieGallery