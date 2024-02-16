// Popup.js
import React from "react";
import "./Popup.css";

const Popup = ({ isOpen, onClose }) => {
  return (
    <div className={`popup ${isOpen ? "open" : ""}`}>
      <div className="popup-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <p>Saving throw needed</p>
      </div>
    </div>
  );
};

export default Popup;
