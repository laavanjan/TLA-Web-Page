import React from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../shared/Heading";
import './gallery.css'
import ImageGallery from "../../../shared/imageGallery/ImageGallery";

const gallery = [
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
    {
        img: "https://live.staticflickr.com/65535/52606422629_6a58469701_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606422629_98cb7606bf_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/52606422639_b6b5c5a859_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606422639_78561eb447_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/52605665782_d9765cc960_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52605665782_ee00f93168_w.jpg',
    },
    {
        img: "https://live.staticflickr.com/65535/52606586820_d94b90a3ec_o.jpg",
        thumbnail: 'https://live.staticflickr.com/65535/52606586820_834a37d6e8_w.jpg',
    },
]





function Gallery() {
    return (
        <div className="gallery-container-div" id="gallery">
            <Container maxWidth='lg' className="gallery-container">
                <Heading >கலை காட்சி கூடம்</Heading>
                <ImageGallery images={gallery} />
                <div style={{ height: '10vh' }}></div>
            </Container>
        </div>
    );
}

export default Gallery