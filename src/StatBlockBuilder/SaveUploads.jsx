import React, { useRef, useState } from "react";
import { defaultStatBlock, normalizeStats } from "./TypesUtils/Types.js";


const SaveUploads = ({ setStatBlock, statBlock, imageGeneratorRef }) => {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const closeImagePreview = () => setImagePreview("");

  const openImagePreview = async () => {
    setIsGeneratingPreview(true);

    try {
      const imageDataUrl = await imageGeneratorRef.current?.getImageDataUrl();
      if (imageDataUrl) setImagePreview(imageDataUrl);
    } catch (error) {
      console.error("Failed to generate stat block image:", error);
      alert("Unable to generate the stat block image.");
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const downloadImage = () => {
    imageGeneratorRef.current?.download(imagePreview);
    closeImagePreview();
  };

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
          stats: normalizeStats(imported.stats),
          speeds: imported.speeds || defaultStatBlock.speeds,
          abilities: {
            ...defaultStatBlock.abilities,
            ...(imported.abilities || {}),
          },
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
      openImagePreview();
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
        className="btn btn-secondary import"
        onClick={() => fileInputRef.current.click()}
      >
        Import Statblock JSON
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

      {(isGeneratingPreview || imagePreview) && (
        <div
          className="stat-block-image-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stat-block-image-modal-title"
        >
          <div className="stat-block-image-modal-content">
            <h2 id="stat-block-image-modal-title">Preview Statblock Image</h2>
            {isGeneratingPreview ? (
              <p>Preparing image...</p>
            ) : (
              <img
                className="stat-block-image-modal-preview"
                src={imagePreview}
                alt={`Preview of ${statBlock.name || "stat block"}`}
              />
            )}
            <div className="stat-block-image-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeImagePreview}
                disabled={isGeneratingPreview}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={downloadImage}
                disabled={isGeneratingPreview || !imagePreview}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SaveUploads;
