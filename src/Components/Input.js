import React, { useState } from "react";
import { Grid } from "@mui/material";
import "./input.css";

export default function Input(props) {
  const {
    showValidation,
    label: labelText,
    icon,
    validationMessage,
    type,
    as,
    ...otherProps
  } = props;

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <Grid item className="input">
      <label>
        <span className="label">{labelText}</span>
        <div className="input-container">
          {as === "textarea" ? (
            <textarea {...otherProps}></textarea>
          ) : (
            <input
              {...otherProps}
              type={type === "password" && showPassword ? "text" : type}
            />
          )}
          <span className="icon-container">
            {typeof icon === "string" && (
              <span className="icon material-symbols-outlined">{icon}</span>
            )}
            {type === "password" && (
              <span
                className="icon material-symbols-outlined"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            )}
          </span>
        </div>
      </label>
      <div className={showValidation ? "inValid-input" : "valid-input"}>
        {validationMessage}
      </div>
    </Grid>
  );
}
