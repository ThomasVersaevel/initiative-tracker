import React, { useRef, useState } from "react";
import "./Soundboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

export const Soundboard = () => {
  const [volume, setVolume] = useState(0.1);
  const audioRefs = useRef({});
  const [customSounds, setCustomSounds] = useState(Array(6).fill(null));

  // Preset sounds
  const sounds = [
    { name: "Hakim", src: "/assets/sounds/hakim.mp3" },
    { name: "Arrow", src: "/assets/sounds/arrow.mp3" },
    { name: "Magic", src: "/assets/sounds/magic.mp3" },
    { name: "Sword", src: "/assets/sounds/sword.mp3" },
    { name: "Miss", src: "/assets/sounds/swordmis.mp3" },
    { name: "Door", src: "/assets/sounds/door.mp3" },
  ];

  const handlePlay = (src) => {
    const audio = audioRefs.current[src];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = volume;
      audio.playbackRate = Math.random() * 0.8 + 0.6;
      audio.play();
    }
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);

    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.volume = newVolume;
    });
  };

  const handleCustomUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newCustomSounds = [...customSounds];
    newCustomSounds[index] = {
      name: file.name.replace(/\.[^/.]+$/, ""),
      src: url,
    };
    setCustomSounds(newCustomSounds);
  };

  return (
    <div className="soundboard-root d-flex">
      <FontAwesomeIcon icon={faVolumeHigh} className="volume-icon" />
      <div className="soundboard-grid">
        {sounds.map((sound) => (
          <div key={sound.src} className="soundboard-item">
            <button
              className="btn btn-secondary sound-button"
              onClick={() => handlePlay(sound.src)}
            >
              {sound.name}
            </button>
            <audio
              ref={(el) => (audioRefs.current[sound.src] = el)}
              src={sound.src}
            />
          </div>
        ))}
      </div>
      <div className="volume-control">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
      {/* Custom sound slots */}
      <div className="soundboard-grid">
        {customSounds.map((sound, index) => (
          <div key={index} className="soundboard-item">
            {sound ? (
              <>
                <button
                  className="btn btn-secondary sound-button"
                  onClick={() => handlePlay(sound.src)}
                >
                  <label className="sound-name">{sound.name}</label>
                </button>
                <audio
                  ref={(el) => (audioRefs.current[sound.src] = el)}
                  src={sound.src}
                />
              </>
            ) : (
              <>
                <label className="btn btn-secondary sound-button">
                  <FontAwesomeIcon icon={faVolumeHigh} />
                  <input
                    type="file"
                    accept="audio/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleCustomUpload(e, index)}
                  />
                </label>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
