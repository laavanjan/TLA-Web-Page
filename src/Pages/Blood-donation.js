import React from "react";
import { Helmet } from "react-helmet";
import BloodIntro from "../Components/events/blood-donation/intro/BloodIntro";
import BloodGallery from "../Components/events/blood-donation/gallery/BloodGallery";

function BloodDonation() {
    return (
        <>
            <Helmet>
                <title>இரத்ததானம்  | தமிழ் இலக்கிய மன்றம்</title>
                <meta
                    name="description"
                    content="சாதி மத பேதமின்றி எமது சொந்தங்களை உதவிக்கரம் கொடுத்து உயிரைக்காப்பாற்றும் வகையில் மேற்கொள்ளப்பட்டு வருகின்றது.இது மன்றத்தின் சாதி மத பேதத்தை கடந்து ஒவ்வொரு வருடமும் வீர நடை போடுகின்றது."
                />
                <meta
                    name="keywords"
                    content="TLA, Tamil Literary Association, Blood Donation"
                />
            </Helmet>
            <BloodIntro />
            <BloodGallery />
        </>
    );
}

export default BloodDonation;
