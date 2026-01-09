import React from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../../shared/Heading";
import ImageGallery from "../../../../shared/imageGallery/ImageGallery";
import './bloodGallery.css'

function srcset(image, size, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows
            }&fit=crop&auto=format&dpr=2 2x`,
    };
}

const images = [
    {
        img:"https://live.staticflickr.com/65535/53524454930_980f2b801b_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524454930_980f2b801b_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524454995_46d0502020.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524454995_46d0502020.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524454955_eb2ec09bf1_c.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524454955_eb2ec09bf1_c.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524196618_000d9f25f1_c.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524196618_000d9f25f1_c.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524020061_e4eb524057_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524020061_e4eb524057_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524339774_08c349392c_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524339774_08c349392c_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53523125462_4d01b45cab_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53523125462_4d01b45cab_z.jpg"
    },
    {
        img:'https://live.staticflickr.com/65535/53524454935_a92d929599_z.jpg',
        thumbnail:'https://live.staticflickr.com/65535/53524454935_a92d929599_z.jpg'
    },
    {
        img:"https://live.staticflickr.com/65535/53524339794_988f8511d5_c.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524339794_988f8511d5_c.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524339839_967983d263_z.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524339839_967983d263_z.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524196673_9f5901b9a6.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524196673_9f5901b9a6.jpg"
    }
]




function BloodGallery() {
    return (
        <div className="gallery-container-div">
            <Container maxWidth='lg' className="gallery-container">
                <Heading >கலை காட்சி கூடம்</Heading>
                <ImageGallery images={images} />
            </Container>
        </div>
    );
}

export default BloodGallery