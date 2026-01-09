import React, { useState, useRef, useEffect } from "react";
import "./popupcard.css";

const PopupCard = ({ buttonText, content }) => {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    setShowPopup(!showPopup);
  };

  return (
    <>
      <div className="popup-container">
        {showPopup && (
          <div ref={popupRef} className="popup-card">
            <div className="popup-card-content">
              {content.map((line, index) => (
                <p key={index} className="popup-line">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
      <button
        ref={buttonRef}
        className={`popup-button ${showPopup ? 'hidden' : ''}`}
        onClick={handleButtonClick}
      >
        {buttonText}
      </button>
    </>
  );
};

export default PopupCard;
