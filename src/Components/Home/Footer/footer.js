import React, { useEffect, useState } from "react";
import './footer.css'
function Footer() {
    return (
        <div className="footer-container">
            <div className="footer-text">
                அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. © {new Date().getFullYear()} தமிழ் இலக்கிய மன்றம் — Tamil Literary Association, University of Moratuwa
            </div>
        </div>
    );
}

export default Footer