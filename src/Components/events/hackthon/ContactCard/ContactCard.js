import React from "react";
import MailIcon from "@material-ui/icons/Mail";
import PhoneIcon from "@material-ui/icons/Phone";
import "./ContctCard.css";
import { Container } from "@mui/material";

function ContactCard() {

  const contactDetails = [
    {
      name: "கேதீஸ்வரன் குகேசன்",
      email: "kkukesan29@gmail.com",
      phone: "075 546 4760",
    },
    {
      name: "காயத்ரி சிவகுமார்",
      email: "sivathri30@gmail.com",
      phone: "076 544 9380",
    },
    {
      name: "வீனியஸ் டிலான்",
      email: "delanvenesious27@gmail.com",
      phone: "071 157 2216"
    }
  ]

  return (
    <Container>
      <h2>தொடர்புகளுக்கு</h2>
      <div className="contact-container">
        {contactDetails.map((contact, index) => (
          <div className="contact-card">
            <div className="contact-label">
              {contact.name}
            </div>
            <div className="contact-label">
              <MailIcon className="contact" />
              {contact.email}
            </div>
            <div className="contact-label">
              <PhoneIcon className="contact" />
              {contact.phone}
            </div>
          </div>
        ))}
      </div>
      <h3 className="wish-text">பங்குபற்றும் மாணவர்களுக்கு எங்கள் “நிரலி” ஒழுங்கமைப்பு குழுவின் வாழ்த்துக்கள்.</h3>
    </Container>
  );
}

export default ContactCard;
