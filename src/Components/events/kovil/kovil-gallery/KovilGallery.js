import React from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../../shared/Heading";
import ImageGallery from "../../../../shared/imageGallery/ImageGallery";
import './kovilGallery.css'

function srcset(image, size, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows
            }&fit=crop&auto=format&dpr=2 2x`,
    };
}

const images = [
    {
        img:"https://live.staticflickr.com/65535/53523157532_a55c3eccae_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53523157532_a55c3eccae_w.jpg"
    },
    {
        img:'https://live.staticflickr.com/65535/53569893782_1642a76bd2.jpg',
        thumbnail:'https://live.staticflickr.com/65535/53569893782_1642a76bd2.jpg'
    },
    {
        img:"https://live.staticflickr.com/65535/53523157432_ba51618dba_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53523157432_ba51618dba_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524486965_eac9fa2f9a_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524486965_eac9fa2f9a_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53523157552_ee050d6e7d_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53523157552_ee050d6e7d_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53523157422_d73e41b074_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53523157422_d73e41b074_w.jpg"
    },
    {
        img:'https://live.staticflickr.com/65535/53571074994_3f8c31f54a.jpg',
        thumbnail:'https://live.staticflickr.com/65535/53571074994_3f8c31f54a.jpg'
    },
    {
        img:'https://live.staticflickr.com/65535/53523157572_2734fb5f28_w.jpg',
        thumbnail:'https://live.staticflickr.com/65535/53523157572_2734fb5f28_w.jpg'
    },
    {
        img:"https://live.staticflickr.com/65535/53524052251_f94e80666d_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524052251_f94e80666d_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524486885_6560ef6ab8_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524486885_6560ef6ab8_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524052301_c632a5d13f_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524052301_c632a5d13f_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524370974_844e522bb9_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524370974_844e522bb9_w.jpg"
    },
    {
        img:'https://live.staticflickr.com/65535/53571074989_69069ae96a_w.jpg',
        thumbnail:'https://live.staticflickr.com/65535/53571074989_69069ae96a_w.jpg'
    },
    {
        img:"https://live.staticflickr.com/65535/53524370979_ea032a81b1_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524370979_ea032a81b1_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524486935_4ceeb15133_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524486935_4ceeb15133_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524228783_fcf872a117_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524228783_fcf872a117_w.jpg"
    },
    {
        img:'https://live.staticflickr.com/65535/53571188155_b989fefc40.jpg',
        thumbnail:'https://live.staticflickr.com/65535/53571188155_b989fefc40.jpg'
    },
    {
        img:'https://live.staticflickr.com/65535/53524486860_9ec8e33dd8_w.jpg',
        thumbnail:'https://live.staticflickr.com/65535/53524486860_9ec8e33dd8_w.jpg'
    },
    {
        img:"https://live.staticflickr.com/65535/53524487000_62143e4152_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524487000_62143e4152_w.jpg"
    }
]




function KovilGallery() {
    return (
        <div className="gallery-container-div">
            <Container maxWidth='lg' className="gallery-container">
                <Heading >கலை காட்சி கூடம்</Heading>
                <ImageGallery images={images} />
            </Container>
        </div>
    );
}

export default KovilGallery