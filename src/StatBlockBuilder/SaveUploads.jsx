import React, { useRef } from "react";
import { defaultStatBlock, defaultStats } from "./TypesUtils/Types.js";


const SaveUploads = ({ setStatBlock, statBlock, imageGeneratorRef }) => {
  const fileInputRef = useRef(null);
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);

        setStatBlock({
          ...defaultStatBlock,
          ...imported,
          stats: {
            ...defaultStats,
            ...(imported.stats || {}),
          },
          speeds: imported.speeds || defaultStatBlock.speeds,
          traits: {
            ...defaultStatBlock.traits,
            ...(imported.traits || {}),
          },
          attacks: {
            ...defaultStatBlock.attacks,
            ...(imported.attacks || {}),
            multiattack: {
              ...defaultStatBlock.attacks.multiattack,
              ...(imported.attacks?.multiattack || {}),
            },
          },
          size: imported.size || defaultStatBlock.size,
          theme: imported.theme || "default",
        });
      } catch (error) {
        console.error("Failed to load stat block:", error);
        alert("Invalid stat block JSON file.");
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSubmit = (e, action) => {
    e.preventDefault();

    const submitAction =
      action || e.currentTarget?.value || e.nativeEvent?.submitter?.value;

    if (submitAction === "download-json") {
      const json = JSON.stringify(statBlock, null, 2);

      const blob = new Blob([json], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${statBlock.name || "stat-block"}.json`;
      link.click();

      URL.revokeObjectURL(url);
    }

    if (submitAction === "download-image") {
      imageGeneratorRef.current?.download();
    }

    if (submitAction === "save") {
      // Database saving later
    }
  };

  return (
    <div className="save-buttons">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => fileInputRef.current.click()}
      >
        Upload Statblock JSON
      </button>

      <button
        className="btn btn-secondary bot"
        type="submit"
        name="action"
        value="save"
        onClick={(e) => handleSubmit(e)}
      >
        Save Statblock
      </button>

      <button
        className="btn btn-secondary bot"
        type="submit"
        name="action"
        value="download-image"
        onClick={(e) => handleSubmit(e)}
      >
        Download Statblock image
      </button>

      <button
        className="btn btn-secondary bot"
        type="submit"
        name="action"
        value="download-json"
        onClick={(e) => handleSubmit(e)}
      >
        Download Stat JSON data
      </button>
    </div>
  );
};
export default SaveUploads;
