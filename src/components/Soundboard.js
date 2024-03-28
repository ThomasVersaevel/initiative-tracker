import React, { useState, useRef } from "react";

export const Soundboard = () => {
  const [audioFile, setAudioFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "audio/mpeg") {
      setAudioFile(URL.createObjectURL(file));
    } else {
      alert("Please select a valid MP3 file.");
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <input
        type="file"
        accept=".mp3"
        onChange={handleFileChange}
        style={{ display: "none" }}
        ref={fileInputRef}
      />
      <button onClick={handleUploadButtonClick}>
        <img src="images/speaker.png" alt="Speaker" />
        Upload MP3
      </button>
      {audioFile && (
        <div>
          <audio controls>
            <source src={audioFile} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};
