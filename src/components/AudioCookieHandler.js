import React, { useEffect } from "react";

const CookieHandler = ({ audioFiles, setAudioFiles }) => {
  useEffect(() => {
    const setAudioCookie = () => {
      const serializedAudioFiles = JSON.stringify(audioFiles);
      document.cookie = `selectedAudio=${serializedAudioFiles}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    };

    setAudioCookie();
  }, [audioFiles]);

  useEffect(() => {
    const getSavedAudioFiles = () => {
      const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
      const audioFiles = cookies
        .filter((cookie) => cookie.startsWith("selectedAudio="))
        .map((cookie) => JSON.parse(cookie.substring("selectedAudio=".length)));
      if (audioFiles.length > 0) {
        setAudioFiles(audioFiles[0]); // Since we're only storing one array of audio files in the cookie
      }
    };

    getSavedAudioFiles();
  }, [setAudioFiles]);

  return null;
};

export default CookieHandler;
