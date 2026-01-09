import React from "react";
import {
    Grid, Container
} from '@mui/material'
import Heading from "../../../../../shared/Heading"
import ImageGallery from "../../../../../shared/imageGallery/ImageGallery"
import './SotkanaiDistrictGallery.css'



function SotkanaiDistrictGallery({images}) {
    const modifiedImages = images.map(image => ({
        img: image,
        thumbnail: image // Duplicate the image URL for thumbnail
    }));
    return (
        <div className="gallery-container-div">
            <Container maxWidth='lg' className="gallery-container">
            
                <Heading >கலை காட்சி கூடம்</Heading>
                <ImageGallery images={modifiedImages} />
            </Container>
        </div>

    );
}

export default SotkanaiDistrictGallery