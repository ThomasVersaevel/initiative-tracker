// Popup.js
import React from "react";
import "./Popup.css";

export function Popup({ isOpen, onClose }) {
  return (
    <div className={`popup ${isOpen ? "open" : ""}`}>
      <div className="popup-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <div>Saving throw needed</div>
      </div>
    </div>
  );
}
