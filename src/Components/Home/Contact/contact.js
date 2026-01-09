import React, { useState, useRef } from "react";
import { Container, Grid } from "@mui/material";
import "./contact.css";
import Heading from "../../../shared/Heading";
import { FaEnvelope, FaFacebook, FaYoutube, FaPhoneAlt } from "react-icons/fa";
import emailjs from "@emailjs/browser";

function Contact() {
    const [formValid, setFormValid] = useState({
        userName: false,
        email: false,
        message: false,
        category: false,
        phoneNumber: false,
    });
    const [buttonClicked, setButtonClicked] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        message: "",
        category: "",
        phoneNumber: "",
    });

    const form = useRef();

    const [responseMessage, setResponseMessage] = useState("");

    const validateName = (userName) => {
        return userName.length > 0;
    };
    const validatePhoneNumber = (phoneNumber) => {
        return phoneNumber.length > 0;
    };
    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };
    const validateCategory = (category) => {
        return category.length > 0;
    };
    const validateMessage = (message) => {
        return message.length > 0 ? true : false;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));

        switch (name) {
            case "userName":
                setFormValid((prevFormValid) => ({
                    ...prevFormValid,
                    userName: validateName(value),
                }));
                break;
            case "phoneNumber":
                setFormValid((prevFormValid) => ({
                    ...prevFormValid,
                    phoneNumber: validatePhoneNumber(value),
                }));
                break;
            case "email":
                setFormValid((prevFormValid) => ({
                    ...prevFormValid,
                    email: validateEmail(value),
                }));
                break;
            case "category":
                setFormValid((prevFormValid) => ({
                    ...prevFormValid,
                    category: validateCategory(value),
                }));
                break;
            case "message":
                setFormValid((prevFormValid) => ({
                    ...prevFormValid,
                    message: validateMessage(value),
                }));
                break;
            default:
            // Handle default case if needed
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonClicked(true);
        emailjs.init("2l7l4CqPtakXvObMJ");

        try {
            if (
                formValid.category &&
                formValid.email &&
                formValid.message &&
                formValid.userName &&
                formValid.phoneNumber
            ) {
                // const response = await fetch("http://localhost:3001/contacts", {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify(formData),
                // });
                emailjs
                    .send("service_v9oy0xw", "template_c9bgvus", formData)
                    .then(
                        () => {
                            setResponseMessage(
                                "உங்களுடைய தகவல் வெற்றிகரமாக அனுப்பப்பட்டுள்ளது"
                            );
                            document.getElementsByClassName(
                                "response-message"
                            )[0].style.color = "green";
                            setFormData({
                                userName: "",
                                email: "",
                                message: "",
                                category: "",
                                phoneNumber: "",
                            });
                            setButtonClicked(false);
                        },
                        (error) => {
                            setResponseMessage(
                                "உங்களுடைய தகவல் அனுப்பப்படவில்லை"
                            );
                            document.getElementsByClassName(
                                "response-message"
                            )[0].style.color = "red";
                        }
                    );
            }
        } catch (error) {
            setResponseMessage("உங்களுடைய தகவல் அனுப்பப்படவில்லை");
            document.getElementsByClassName("response-message")[0].style.color =
                "red";
        }
    };

    const goSocialMedia = (url) => {
        window.open(url, "_blank");
    };

    return (
        <div className="contact-container" id="contact">
            <Container
                maxWidth="lg"
                className="contact-container-div"
                id="contact"
            >
                <Heading>தொடர்புகள்</Heading>

                <Grid container spacing={2}>
                    <Grid item className="col-left">
                        <Grid item container spacing={{ md: 2 }}>
                            <Grid item xs={12} md={6}>
                                <div className="contact-row">பெயர்</div>
                                <div className="contact-icon-div">
                                    <input
                                        className="contact-input"
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleInputChange}
                                    ></input>
                                    <span className="contact-icon material-symbols-outlined">
                                        person
                                    </span>
                                </div>
                                <div
                                    className={
                                        buttonClicked && !formData.userName
                                            ? "inValid-input"
                                            : "valid-input"
                                    }
                                >
                                    பெயரை சரியாக உள்ளிடவும்
                                </div>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <div className="contact-row">தொலைபேசி எண்</div>
                                <div className="contact-icon-div">
                                    <input
                                        className="contact-input"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                    ></input>
                                    <span className="contact-icon material-symbols-outlined">
                                        phone
                                    </span>
                                </div>
                                <div
                                    className={
                                        buttonClicked && !formData.phoneNumber
                                            ? "inValid-input"
                                            : "valid-input"
                                    }
                                >
                                    தொலைபேசி எண்னை சரியாக உள்ளிடவும்
                                </div>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <div className="contact-row">மின்னஞ்சல்</div>
                            <div className="contact-icon-div">
                                <input
                                    className="contact-input"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                ></input>
                                <span className="contact-icon material-symbols-outlined">
                                    mail
                                </span>
                            </div>
                            <div
                                className={
                                    buttonClicked && !formData.email
                                        ? "inValid-input"
                                        : "valid-input"
                                }
                            >
                                மின்னஞ்சலை சரியாக உள்ளிடவும்
                            </div>
                        </Grid>
                        <Grid item>
                            <div className="contact-row">தொடர்பு வகை</div>
                            <div className="contact-icon-div">
                                <select
                                    className="contact-select contact-icon-div ${formData.category ? '' : 'inValid'}"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="" disabled hidden>
                                        {/* ஓர் வகைய தேர்ந்தெடு */}
                                    </option>
                                    <option value="Sponsor">
                                        அனுசரனையாளர்
                                    </option>
                                    <option value="Wellwisher">
                                        நலன் விரும்பி
                                    </option>
                                    <option value="Student">மாணவர்</option>
                                </select>
                            </div>
                            <div
                                className={
                                    buttonClicked && !formData.category
                                        ? "inValid-input"
                                        : "valid-input"
                                }
                            >
                                தொடர்புவகையை தெரிவு செய்யவும்
                            </div>
                        </Grid>
                        <Grid item>
                            <div className="contact-row">தகவல்</div>
                            <div className="contact-icon-div">
                                <textarea
                                    className="contact-input message-input"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                            <div
                                className={
                                    buttonClicked && !formData.message
                                        ? "inValid-input"
                                        : "valid-input"
                                }
                            >
                                தகவலை சரியாக உள்ளிடவும்
                            </div>
                        </Grid>
                        <Grid
                            container
                            item
                            justifyContent="flex-end"
                            paddingBottom={2}
                            paddingTop={2}
                        >
                            <button
                                className="contact-send-button"
                                onClick={handleSubmit}
                            >
                                அனுப்பு
                            </button>
                        </Grid>
                        <Grid item>
                            <div className="response-message">
                                {responseMessage}
                            </div>
                        </Grid>
                    </Grid>

                    <Grid item>
                        <div className="col-right">
                            <Grid item>
                                <div
                                    className="nav-text"
                                    style={{
                                        display: "flex",
                                        marginRight: "10px",
                                    }}
                                >
                                    <FaEnvelope />
                                    <div style={{ marginLeft: "10px" }}>
                                        மின்னஞ்சல்
                                    </div>
                                </div>
                                <a
                                    className="nav-link"
                                    href="mailto:thamizhiyam@gmail.com"
                                >
                                    thamizhiyam@gmail.com
                                </a>
                            </Grid>
                            <Grid item>
                                <div
                                    className="nav-text"
                                    style={{
                                        display: "flex",
                                        marginRight: "10px",
                                    }}
                                >
                                    <FaPhoneAlt />
                                    <div style={{ marginLeft: "10px" }}>
                                        தொலைபேசி
                                    </div>
                                </div>
                                <a className="nav-link" href="">
                                    அபினேஷ் - 076 843 2752
                                </a>
                            </Grid>
                            <Grid item>
                                <div
                                    className="nav-text"
                                    style={{
                                        display: "flex",
                                        marginRight: "10px",
                                    }}
                                    onClick={() =>
                                        goSocialMedia(
                                            "https://web.facebook.com/TLAuom"
                                        )
                                    }
                                >
                                    <FaFacebook />{" "}
                                    <div style={{ marginLeft: "10px" }}>
                                        முகப்புத்தகம்
                                    </div>
                                </div>
                            </Grid>
                            <Grid item>
                                <div
                                    className="nav-text"
                                    style={{
                                        display: "flex",
                                        marginRight: "10px",
                                    }}
                                    onClick={() =>
                                        goSocialMedia(
                                            "https://www.youtube.com/@TLAUOM"
                                        )
                                    }
                                >
                                    <FaYoutube />{" "}
                                    <div style={{ marginLeft: "10px" }}>
                                        வலைஒளி
                                    </div>
                                </div>
                            </Grid>
                        </div>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}
export default Contact;
