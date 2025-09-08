import React, { useRef, useState } from "react";
import "./Soundboard.css";

export const Soundboard = () => {
  const [volume, setVolume] = useState(0.1);
  const audioRefs = useRef({});

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
      audio.currentTime = 0; // restart
      audio.volume = volume; // apply current global volume
      audio.playbackRate = Math.random() * 0.8 + 0.6;
      audio.play();
    }
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);

    // update all audio players immediately
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.volume = newVolume;
    });
  };

  return (
    <div className="soundboard-root d-flex">
      <img
        className="button-img"
        src="images/speakerplaying.png"
        alt="Speaker"
      />
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
    </div>
  );
};
