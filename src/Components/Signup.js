import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import Heading from "../shared/Heading";
import Input from "./Input";
import SimplifiedButton from "./SimplifiedButton";
import { signup } from "../helpers/server";
import { useAuth } from "../providers/AuthProvider";
import "./signup.css";

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validateNotEmpty = (str) => str.length > 0;
const validatePhoneNo = (phoneNo) =>
  typeof phoneNo === "string" && phoneNo.length >= 10;
const validateStudentRegistrationNumber = (regNo) => regNo.length > 0;

function Signup({ changeModal }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [formValid, setFormValid] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phoneNo: false,
    studentRegistrationNumber: false,
    studentStatus: false,
    profileImage: false,
  });
  const [buttonClicked, setButtonClicked] = useState(false);
  const [signUpData, setsignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNo: "",
    studentRegistrationNumber: "",
    studentStatus: "", // Only one value allowed: "current" or "passout"
    profileImage: null,
  });
  const [imageUrl, setImageUrl] = useState("");
  // const [profileImage, setProfileImage] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  // Convert file to Base64
  // const convertToBase64 = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = (error) => reject(error);
  //   });
  // };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // const base64String = await convertToBase64(file);
        // console.log(base64String);
        setImageUrl(URL.createObjectURL(file));
        setsignUpData((prevData) => ({
          ...prevData,
          profileImage: file,
        }));
      } catch (error) {
        console.error("Geting the image is not done:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setsignUpData((prevData) => ({ ...prevData, [name]: value }));

    let isValid = true;

    switch (name) {
      case "email":
        isValid = validateEmail(value);
        setFormValid((prevFormValid) => ({
          ...prevFormValid,
          email: isValid,
        }));
        break;
      case "password":
      case "name":
        isValid = validateNotEmpty(value);
        setFormValid((prevFormValid) => ({
          ...prevFormValid,
          [name]: isValid,
        }));
        break;
      case "confirmPassword":
        isValid = value === signUpData.password;
        setFormValid((prevFormValid) => ({
          ...prevFormValid,
          confirmPassword: isValid,
        }));
        break;
      case "phoneNo":
        isValid = validatePhoneNo(value);
        setFormValid((prevFormValid) => ({
          ...prevFormValid,
          phoneNo: isValid,
        }));
        break;
      case "studentRegistrationNumber":
        isValid =
          signUpData.studentStatus === "current"
            ? validateStudentRegistrationNumber(value)
            : true;
        setFormValid((prevFormValid) => ({
          ...prevFormValid,
          studentRegistrationNumber: isValid,
        }));
        break;
      default:
        break;
    }
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    const newStatus = checked ? name : "";

    setsignUpData((prevData) => ({
      ...prevData,
      studentStatus: newStatus,
    }));

    setFormValid((prevFormValid) => ({
      ...prevFormValid,
      studentStatus: validateNotEmpty(newStatus),
      studentRegistrationNumber:
        newStatus === "current"
          ? validateStudentRegistrationNumber(
              signUpData.studentRegistrationNumber
            )
          : true,
    }));
  };

  const logFormData = (formData) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
  };

  // const handleImageChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setsignUpData((prevData) => ({
  //       ...prevData,
  //       profileImage: file,
  //     }));
  //   }
  // };

  const displayError = (error) => {
    if (error.response) {
      if (error.response.status === 400) {
        setResponseMessage("உங்களுடைய தகவல் தவறாக உள்ளது");
      } else if (error.response.status === 500) {
        setResponseMessage("சர்வர் பிழை");
      } else if (error.response.data) {
        setResponseMessage(error.response.data.message);
      }
    }
    setTimeout(() => {
      setResponseMessage("");
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonClicked(true);

    // Check if all required fields are filled
    if (
      !signUpData.name ||
      !signUpData.email ||
      !signUpData.password ||
      !signUpData.confirmPassword ||
      !signUpData.phoneNo ||
      (signUpData.studentStatus === "current" &&
        !signUpData.studentRegistrationNumber) ||
      !signUpData.studentStatus
    ) {
      setResponseMessage("அனைத்து தேவைப்படும் புலங்களை நிரப்பவும்");
      setTimeout(() => {
        setResponseMessage("");
      }, 3000);
      return;
    }

    const formData = new FormData();
    formData.append("name", signUpData.name);
    formData.append("email", signUpData.email);
    formData.append("password", signUpData.password);
    formData.append("phoneNo", signUpData.phoneNo);
    formData.append(
      "studentRegistrationNumber",
      signUpData.studentRegistrationNumber
    );
    formData.append("studentStatus", signUpData.studentStatus);

    if (signUpData.profileImage) {
      formData.append("profileImage", signUpData.profileImage);
      console.log("Image appended to form data", signUpData.profileImage);
    }
    // // Log form data content
    // logFormData(formData);

    try {
      console.log("Sending form data:", formData);
      logFormData(formData);
      await signup(formData);

      auth.loggedIn(signUpData);
      setResponseMessage("உங்களுடைய தகவல் வெற்றிகரமாக அனுப்பப்பட்டது");
      setsignUpData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNo: "",
        studentRegistrationNumber: "",
        studentStatus: "",
        profileImage: null,
      });
      setButtonClicked(false);
      setImageUrl("");
      changeModal("login");
    } catch (error) {
      console.error("Error during signup:", error);
      displayError(error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box textAlign="center" my={4}>
        <Heading>கணக்கை உருவாக்கு</Heading>
      </Box>
      <Grid container spacing={2} className="sign-up--form-content">
        <Grid item xs={12}>
          <Box className="sign-up--top-section">
            <div className="sign-up--form-fields">
              <Input
                onChange={handleInputChange}
                value={signUpData.name}
                name="name"
                label="பெயர் *" // Marked as required
                icon="person"
                showValidation={buttonClicked && !formValid.name}
                validationMessage="பெயரை சரியாக உள்ளிடவும்"
              />
              <Input
                onChange={handleInputChange}
                value={signUpData.phoneNo}
                name="phoneNo"
                label="தொலைபேசி இலக்கம் *" // Marked as required
                icon="call"
                showValidation={buttonClicked && !formValid.phoneNo}
                validationMessage="தொலைபேசி இலக்கத்தை சரியாக உள்ளிடவும்"
              />
            </div>
            <label className="sign-up--image-preview">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div>
                {signUpData.profileImage == null ? (
                  <span className="icon material-symbols-outlined">
                    add_a_photo
                  </span>
                ) : (
                  <img src={imageUrl} alt="Preview" />
                )}
              </div>
            </label>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <FormControl
            component="fieldset"
            error={buttonClicked && !formValid.studentStatus}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        color: "#022345",
                        "&.Mui-checked": {
                          color: "#022345",
                        },
                      }}
                      checked={signUpData.studentStatus === "current"}
                      onChange={handleCheckboxChange}
                      name="current"
                    />
                  }
                  label="தற்காலிக மாணவர்"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        color: "#022345",
                        "&.Mui-checked": {
                          color: "#022345",
                        },
                      }}
                      checked={signUpData.studentStatus === "passout"}
                      onChange={handleCheckboxChange}
                      name="passout"
                    />
                  }
                  label="பட்டம் பெற்ற மாணவர்"
                />
              </Grid>
            </Grid>
            {buttonClicked && !formValid.studentStatus && (
              <FormHelperText>இந்த புலத்தைத் தேர்வுசெய்யவும்</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Input
            onChange={handleInputChange}
            value={signUpData.studentRegistrationNumber}
            name="studentRegistrationNumber"
            label="மாணவர் பதிவு எண்"
            icon="info"
            showValidation={
              buttonClicked &&
              signUpData.studentStatus === "current" &&
              !formValid.studentRegistrationNumber
            }
            validationMessage="மாணவர் பதிவு எண்ணை சரியாக உள்ளிடவும்"
            required={signUpData.studentStatus === "current"}
          />
        </Grid>

        <Grid item xs={12}>
          <Input
            onChange={handleInputChange}
            value={signUpData.email}
            name="email"
            label="மின்னஞ்சல் *" // Marked as required
            icon="mail"
            showValidation={buttonClicked && !formValid.email}
            validationMessage="மின்னஞ்சலை சரியாக உள்ளிடவும்"
            type="email"
          />
        </Grid>

        <Grid item xs={12}>
          <Input
            onChange={handleInputChange}
            value={signUpData.password}
            name="password"
            label="கடவுச்சொல் *" // Marked as required
            showValidation={buttonClicked && !formValid.password}
            validationMessage="கடவுச்சொல்லை சரியாக உள்ளிடவும்"
            type="password"
          />
        </Grid>

        <Grid item xs={12}>
          <Input
            onChange={handleInputChange}
            value={signUpData.confirmPassword}
            name="confirmPassword"
            label="கடவுச்சொல் மீண்டும் *" // Marked as required
            showValidation={buttonClicked && !formValid.confirmPassword}
            validationMessage="கடவுச்சொல் பொருந்தவில்லை"
            type="password"
          />
        </Grid>

        <Grid item xs={12} textAlign="center">
          <button
            className="contact-send-button"
            onClick={handleSubmit}
            type="submit"
          >
            அனுப்பு
          </button>
        </Grid>

        <Grid item xs={12} textAlign="center">
          <span>ஏற்கனவே கணக்கு உள்ளதா? </span>
          <SimplifiedButton onClick={() => changeModal("login")}>
            உள்நுழை
          </SimplifiedButton>
        </Grid>

        <Grid item xs={12}>
          <Box
            textAlign="center"
            className="response-message"
            color={responseMessage.includes("வெற்றிகரமாக") ? "green" : "red"}
          >
            {responseMessage}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Signup;
