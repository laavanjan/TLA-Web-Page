import React, { useState } from "react";
import { Container, Grid } from "@mui/material";
import Heading from "../shared/Heading";
import Input from "./Input";
import { login } from "../helpers/server";
import { useAuth } from "../providers/AuthProvider";
import SimplifiedButton from "./SimplifiedButton";
import { useNavigate } from "react-router-dom";

function Login({ changeModal }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [formValid, setFormValid] = useState({
    email: false,
    password: false,
  });
  const [buttonClicked, setButtonClicked] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [responseMessage, setResponseMessage] = useState("");

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "email") {
      setFormValid((prevFormValid) => ({
        ...prevFormValid,
        email: validateEmail(value),
      }));
    } else if (name === "password") {
      setFormValid((prevFormValid) => ({
        ...prevFormValid,
        password: value.length > 0,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonClicked(true);

    if (!formValid.email || !formValid.password) {
      return;
    }

    try {
      await login(formData);
      auth.loggedIn(formData);
      setResponseMessage("உங்களுடைய தகவல் வெற்றிகரமாக அனுப்பப்பட்டுள்ளது");
      setFormData({ email: "", password: "" });
      setButtonClicked(false);
      changeModal("close"); // Close the modal
      navigate("signup"); // Navigate to the signup page
    } catch (error) {
      setResponseMessage("உங்களுடைய தகவல் அனுப்பப்படவில்லை");
      setTimeout(() => {
        setResponseMessage("");
      }, 3000);
      setButtonClicked(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Heading>உள்நுழை</Heading>
      <Grid>
        <Input
          onChange={handleInputChange}
          value={formData.email}
          name="email"
          label="மின்னஞ்சல்"
          icon="mail"
          showValidation={buttonClicked && !formValid.email}
          validationMessage="மின்னஞ்சலை சரியாக உள்ளிடவும்"
        />
        <Input
          onChange={handleInputChange}
          value={formData.password}
          name="password"
          label="கடவுச்சொல்"
          showValidation={buttonClicked && !formValid.password}
          validationMessage="கடவுச்சொல்லை சரியாக உள்ளிடவும்"
          type="password"
        />
        <Grid
          container
          justifyContent="flex-end"
          paddingBottom={2}
          paddingTop={2}
        >
          <button className="contact-send-button" onClick={handleSubmit}>
            அனுப்பு
          </button>
        </Grid>
        <Grid item>
          <div
            className="response-message"
            style={{
              color: responseMessage.includes("வெற்றிகரமாக") ? "green" : "red",
            }}
          >
            {responseMessage}
          </div>
        </Grid>
        <Grid container justifyContent="center">
          <span>கணக்கு இல்லையா? </span>
          <SimplifiedButton
            className="signup-button"
            onClick={() => changeModal("signup")}
          >
            கணக்கை உருவாக்கு
          </SimplifiedButton>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Login;
