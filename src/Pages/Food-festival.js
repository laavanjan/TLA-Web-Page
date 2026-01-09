import React from "react";
import { Helmet } from "react-helmet";
import FoodIntro from "../Components/events/food-festival/intro/foodIntro";
import FoodGallery from "../Components/events/food-festival/gallery/foodGallery";

function FoodFestival() {
    return (
        <>
            <Helmet>
                <title>உணவுத் திருவிழா  | தமிழ் இலக்கிய மன்றம்</title>
                <meta
                    name="description"
                    content="எமது பாரம்பரிய உணவுகளை சகோதர மொழி மாணவர்களுடன் பகிர்ந்துண்னும் நிகழ்வு"
                />
                <meta
                    name="keywords"
                    content="TLA, Tamil Literary Association, Food Festival"
                />
            </Helmet>
            <FoodIntro />
            <FoodGallery />
        </>
    );
}

export default FoodFestival;
