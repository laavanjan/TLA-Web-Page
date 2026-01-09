import React from "react";
import {
    Container
} from '@mui/material'
import Heading from "../../../../shared/Heading";
import ImageGallery from "../../../../shared/imageGallery/ImageGallery";
import './pplgallery.css';

const images = [
    {
        img: "https://live.staticflickr.com/65535/53529246361_935d481bbe_c.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/53529246361_935d481bbe_c.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/53529640480_cd27dd8c64_w.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/53529640480_cd27dd8c64_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/53529676285_3444fcef33.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/53529676285_3444fcef33.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/53528345717_c32d2b0c81.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/53528345717_c32d2b0c81.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/53529246366_183fcc9a14_z.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/53529246366_183fcc9a14_z.jpg',
    },
    {
        img:"https://live.staticflickr.com/65535/53542772542_c205433a25_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53542772542_c205433a25_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53542772547_ab18b00505_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53542772547_ab18b00505_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53543819633_628dc5e703_c.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53543819633_628dc5e703_c.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53544073270_4cc247ae8a_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53544073270_4cc247ae8a_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53543819628_c75f92bd37_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53543819628_c75f92bd37_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53543965064_9e323410df_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53543965064_9e323410df_z.jpg"
    }
]

function PplGallery() {
    return (
        <div className="ppl-gallery-container-div">
            <Container maxWidth='lg' className="ppl-gallery-container">
                <Heading >கலை காட்சி கூடம்</Heading>
                <ImageGallery images={images} />
            </Container>
        </div>
    );
}

export default PplGallery