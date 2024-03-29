import React, { useState, useRef } from "react";
import "./Soundboard.css";

export const Soundboard = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
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

  const playAudioOnce = () => {
    setAudioPlaying(true);
    audioRef.current.play();
  };

  const handleAudioEnded = () => {
    setAudioPlaying(false);
    audioRef.current.currentTime = 0; // Reset audio to the beginning
  };

  return (
    <div>
      {!audioFile && (
        <button
          className="btn btn-secondary bot"
          onClick={handleUploadButtonClick}
        >
          +<img className="button-img" src="images/speaker.png" alt="Speaker" />
        </button>
      )}
      <input
        type="file"
        accept=".mp3"
        onChange={handleFileChange}
        style={{ display: "none" }}
        ref={fileInputRef}
      />
      {audioFile && (
        <div className="audio-player">
          <audio ref={audioRef} src={audioFile} onEnded={handleAudioEnded} />
          <button className="btn btn-secondary bot" onClick={playAudioOnce}>
            <img
              className="button-img"
              src="images/speakerplaying.png"
              alt="Speaker"
            />
          </button>
        </div>
      )}
    </div>
  );
};
