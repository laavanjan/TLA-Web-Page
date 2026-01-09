import React from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../../shared/Heading";
import ImageGallery from "../../../../shared/imageGallery/ImageGallery";
import './vanivillaGallery.css'

function srcset(image, size, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows
            }&fit=crop&auto=format&dpr=2 2x`,
    };
}

const images = [
    {
        img:"https://live.staticflickr.com/65535/53528551741_ac1a470c0c_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528551741_ac1a470c0c_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528551731_21a8195ffc_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528551731_21a8195ffc_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53527650732_89f5dbc483_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53527650732_89f5dbc483_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528865934_67f5e2cb16_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528865934_67f5e2cb16_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528982795_9d725f6bba_c.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528982795_9d725f6bba_c.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528982800_6293d1d53f_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528982800_6293d1d53f_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528551781_31915bb87d_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528551781_31915bb87d_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528865969_4f8205354d_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528865969_4f8205354d_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528731458_681f05fb27_c.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528731458_681f05fb27_c.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528865899_42f78db507_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528865899_42f78db507_w.jpg"
    }
]




function VaniVillaGallery() {
    return (
        <div className="gallery-container-div">
            <Container maxWidth='lg' className="gallery-container">
                <Heading >கலை காட்சி கூடம்</Heading>
                <ImageGallery images={images} />
            </Container>
        </div>
    );
}

export default VaniVillaGallery