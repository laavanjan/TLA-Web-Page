import React, { useState } from "react";
import "./contact.css";
import { FaEnvelope, FaFacebook, FaYoutube, FaPhoneAlt, FaUser, FaPaperPlane, FaTag, FaCommentDots, FaInstagram } from "react-icons/fa";
import emailjs from "@emailjs/browser";

function Contact() {
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        message: "",
        category: "",
        phoneNumber: "",
    });
    const [buttonClicked, setButtonClicked] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");

    const validateName     = (v) => v.length > 0;
    const validatePhone    = (v) => v.length > 0;
    const validateEmail    = (v) => /\S+@\S+\.\S+/.test(v);
    const validateCategory = (v) => v.length > 0;
    const validateMessage  = (v) => v.length > 0;

    const isValid = {
        userName:    validateName(formData.userName),
        phoneNumber: validatePhone(formData.phoneNumber),
        email:       validateEmail(formData.email),
        category:    validateCategory(formData.category),
        message:     validateMessage(formData.message),
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setButtonClicked(true);
        if (!isValid.userName || !isValid.phoneNumber || !isValid.email || !isValid.category || !isValid.message) return;

        emailjs.init("2l7l4CqPtakXvObMJ");
        emailjs.send("service_v9oy0xw", "template_c9bgvus", formData).then(
            () => {
                setResponseMessage("உங்களுடைய தகவல் வெற்றிகரமாக அனுப்பப்பட்டுள்ளது");
                setResponseType("success");
                setFormData({ userName: "", email: "", message: "", category: "", phoneNumber: "" });
                setButtonClicked(false);
            },
            () => {
                setResponseMessage("உங்களுடைய தகவல் அனுப்பப்படவில்லை");
                setResponseType("error");
            }
        );
    };

    const goSocial = (url) => window.open(url, "_blank");

    const showErr = (field) => buttonClicked && !isValid[field];

    return (
        <div className="contact-section" id="contact">
            <div className="contact-inner">

                <div className="contact-heading-wrap">
                    <div className="contact-kicker">தொடர்புகள்</div>
                    <h2 className="contact-main-heading">எங்களை தொடர்பு கொள்ளுங்கள்</h2>
                    <p className="contact-sub">கேள்விகள், அனுசரணை, அல்லது ஆர்வத்துக்கு நாங்கள் இங்கே இருக்கிறோம்</p>
                </div>

                <div className="cf-layout-grid">

                    {/* Form */}
                    <div className="contact-form-card">
                        <form onSubmit={handleSubmit} noValidate>

                            <div className="cf-row">
                                <div className="cf-field-inline">
                                    <label className="cf-label">பெயர்</label>
                                    <div className={`cf-input-wrap${showErr("userName") ? " cf-invalid" : ""}`}>
                                        <span className="cf-icon"><FaUser /></span>
                                        <input className="cf-input" name="userName" value={formData.userName} onChange={handleInputChange} placeholder="உங்கள் பெயர்" />
                                    </div>
                                    <span className={`cf-error${showErr("userName") ? " show" : ""}`}>பெயரை உள்ளிடவும்</span>
                                </div>

                                <div className="cf-field-inline">
                                    <label className="cf-label">தொலைபேசி எண்</label>
                                    <div className={`cf-input-wrap${showErr("phoneNumber") ? " cf-invalid" : ""}`}>
                                        <span className="cf-icon"><FaPhoneAlt /></span>
                                        <input className="cf-input" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="07X XXX XXXX" />
                                    </div>
                                    <span className={`cf-error${showErr("phoneNumber") ? " show" : ""}`}>தொலைபேசி எண்னை உள்ளிடவும்</span>
                                </div>
                            </div>

                            <div className="cf-field">
                                <label className="cf-label">மின்னஞ்சல்</label>
                                <div className={`cf-input-wrap${showErr("email") ? " cf-invalid" : ""}`}>
                                    <span className="cf-icon"><FaEnvelope /></span>
                                    <input className="cf-input" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@email.com" />
                                </div>
                                <span className={`cf-error${showErr("email") ? " show" : ""}`}>சரியான மின்னஞ்சலை உள்ளிடவும்</span>
                            </div>

                            <div className="cf-field">
                                <label className="cf-label">தொடர்பு வகை</label>
                                <div className={`cf-input-wrap${showErr("category") ? " cf-invalid" : ""}`}>
                                    <span className="cf-icon"><FaTag /></span>
                                    <select className="cf-select" name="category" value={formData.category} onChange={handleInputChange}>
                                        <option value="" disabled hidden>தேர்ந்தெடுக்கவும்</option>
                                        <option value="Sponsor">அனுசரனையாளர்</option>
                                        <option value="Wellwisher">நலன் விரும்பி</option>
                                        <option value="Student">மாணவர்</option>
                                    </select>
                                </div>
                                <span className={`cf-error${showErr("category") ? " show" : ""}`}>தொடர்பு வகையை தெரிவு செய்யவும்</span>
                            </div>

                            <div className="cf-field">
                                <label className="cf-label">தகவல்</label>
                                <div className={`cf-input-wrap${showErr("message") ? " cf-invalid" : ""}`}>
                                    <span className="cf-icon" style={{ alignSelf: "flex-start", paddingTop: "13px" }}><FaCommentDots /></span>
                                    <textarea className="cf-textarea" name="message" value={formData.message} onChange={handleInputChange} placeholder="உங்கள் தகவலை இங்கே எழுதுங்கள்..." />
                                </div>
                                <span className={`cf-error${showErr("message") ? " show" : ""}`}>தகவலை உள்ளிடவும்</span>
                            </div>

                            <div className="cf-submit-row">
                                <span className={`cf-response${responseType ? ` ${responseType}` : ""}`}>{responseMessage}</span>
                                <button className="cf-btn" type="submit">
                                    <FaPaperPlane /> அனுப்பு
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Info panel */}
                    <div className="contact-info-panel">

                        <div className="contact-info-card">
                            <p className="contact-info-card-title">தொடர்பு விவரங்கள்</p>

                            <a className="contact-info-item" href="mailto:thamizhiyam@gmail.com">
                                <div className="contact-info-icon"><FaEnvelope /></div>
                                <div className="contact-info-text">
                                    <span className="contact-info-label">மின்னஞ்சல்</span>
                                    <span className="contact-info-value">thamizhiyam@gmail.com</span>
                                </div>
                            </a>

                            <div className="contact-info-item">
                                <div className="contact-info-icon"><FaPhoneAlt /></div>
                                <div className="contact-info-text">
                                    <span className="contact-info-label">தொலைபேசி</span>
                                    <span className="contact-info-value">அபினேஷ் - 076 843 2752</span>
                                </div>
                            </div>
                        </div>

                        <div className="contact-social-card">
                            <p className="contact-social-title">சமூக ஊடகங்கள்</p>
                            <div className="contact-social-row">
                                <button className="contact-social-btn" onClick={() => goSocial("https://web.facebook.com/TLAuom")}>
                                    <FaFacebook />
                                    முகப்புத்தகம்
                                </button>
                                <button className="contact-social-btn" onClick={() => goSocial("https://www.youtube.com/@TLAUOM")}>
                                    <FaYoutube />
                                    வலைஒளி
                                </button>
                                <button className="contact-social-btn" onClick={() => goSocial("https://www.instagram.com/tla_uom/")}>
                                    <FaInstagram />
                                    இன்ஸ்டாகிராம்
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
