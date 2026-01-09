import React from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../../shared/Heading";
import ImageGallery from "../../../../shared/imageGallery/ImageGallery";
import './thamilaruviGallery.css'

function srcset(image, size, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows
            }&fit=crop&auto=format&dpr=2 2x`,
    };
}

const images = [
    {
        img:"https://live.staticflickr.com/65535/53528732061_22082c7d9e.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528732061_22082c7d9e.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528731781_e4ce10977f_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528731781_e4ce10977f_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528913508_9cb7b406e0_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528913508_9cb7b406e0_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528913448_5dcb285bf8_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528913448_5dcb285bf8_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53529046714_1ffe33753e_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53529046714_1ffe33753e_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528731786_840120d3ef_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528731786_840120d3ef_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53527831237_7985b04658_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53527831237_7985b04658_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53527831287_c6ae9a55c6_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53527831287_c6ae9a55c6_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528731856_317eaa339a_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528731856_317eaa339a_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53527831347_90c356de71_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53527831347_90c356de71_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53529046654_af52fe8434_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53529046654_af52fe8434_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53528913668_55d45dec49_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53528913668_55d45dec49_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53529163710_95d8227995_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53529163710_95d8227995_w.jpg"
    },
   
    {
        img:"https://live.staticflickr.com/65535/53527831462_a11d288b47.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53527831462_a11d288b47.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53529163750_4fb815b65c_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53529163750_4fb815b65c_w.jpg"
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