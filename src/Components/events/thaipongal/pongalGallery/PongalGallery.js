import React from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../../shared/Heading";
import ImageGallery from "../../../../shared/imageGallery/ImageGallery";
import './pongalGallery.css'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

function srcset(image, size, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows
            }&fit=crop&auto=format&dpr=2 2x`,
    };
}

const images = [
    {
        img:"https://live.staticflickr.com/65535/53524521665_7259095ea6_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524521665_7259095ea6_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524264038_f4d0807b72_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524264038_f4d0807b72_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524086926_ea09175f21_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524086926_ea09175f21_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524086701_c800355709_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524086701_c800355709_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53523192002_cb174a1c6d_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53523192002_cb174a1c6d_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524263993_a5137a05a8.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524263993_a5137a05a8.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524405679_77720351b1.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524405679_77720351b1.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524405839_2e772974ef.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524405839_2e772974ef.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524405754_e4ac762544_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524405754_e4ac762544_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524265613_7565a0ec57_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524265613_7565a0ec57_w.jpg"
    },
    {
        img:"https://live.staticflickr.com/65535/53524405739_647973c3cf_w.jpg",
        thumbnail:"https://live.staticflickr.com/65535/53524405739_647973c3cf_w.jpg"
    },
    {
        img:'https://live.staticflickr.com/65535/53524521910_c5d36c586f_w.jpg',
        thumbnail:'https://live.staticflickr.com/65535/53524521910_c5d36c586f_w.jpg'
    },
    {
        img:'https://live.staticflickr.com/65535/53523192192_bda229209c.jpg',
        thumbnail:'https://live.staticflickr.com/65535/53523192192_bda229209c.jpg'
    }
]




function PongalGallery() {
    return (
        <div className="gallery-container-div">
            <Container maxWidth='lg' className="gallery-container">
                <Heading >கலை காட்சி கூடம்</Heading>
                <ImageGallery images={images} />
            </Container>
        </div>
        // <Container maxWidth='lg'>
        //     <Heading >கலை காட்சி கூடம்</Heading>
        //     <ImageList
        //         variant="quilted"
        //         cols={4}
        //         rowHeight={300}
        //     >
        //         {images.map((item) => (
        //             <ImageListItem key={item.img} 
        //                 sx={{ m: 0.5, borderRadius: '50%' }}
        //                 >
        //                 <img className="gallery-images"
        //                     {...srcset(item.img, 121)}
        //                     //  alt={images.title}
        //                     loading="lazy"
        //                 />
        //             </ImageListItem>
        //         ))}

        //         {/* <div style={{ height: '10vh' }}></div> */}
        //     </ImageList>
        // </Container>
    );
}

export default PongalGallery