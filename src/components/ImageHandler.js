import { useCallback, useEffect } from "react";

export function ImageHandler({
  highlightedRow,
  selectedFile,
  setSelectedFile,
  selectedStationary,
  setSelectedStationary,
  setUploadedImages,
  uploadedImages,
  setUploadedStationary,
  uploadedStationary,
}) {
  const handleUpload = useCallback(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prevImages) => {
          const tempImages = [...prevImages];
          tempImages[highlightedRow] = reader.result;
          return tempImages;
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile, setUploadedImages, highlightedRow]);

  const handleStationaryUpload = useCallback(() => {
    if (selectedStationary) {
      const reader2 = new FileReader();
      reader2.onloadend = () => {
        setUploadedStationary(reader2.result);
      };
      reader2.readAsDataURL(selectedStationary);
    }
  }, [selectedStationary, setUploadedStationary]);

  const deleteImage = (nr) => {
    if (nr === 1) {
      setSelectedFile(null);
    } else {
      setSelectedStationary(null);
    }
  };

  useEffect(() => {
    handleUpload();
  }, [handleUpload, selectedFile]);

  useEffect(() => {
    handleStationaryUpload();
  }, [handleStationaryUpload, selectedStationary]);

  return (
    <>
      {selectedFile !== null && (
        <div className="image-container">
          <img
            className="uploaded-image"
            src={uploadedImages[highlightedRow]}
            alt={""}
          />
          <div className="img-buttons">
            <button
              className="delete-img-button"
              onClick={() => deleteImage(1)}
            >
              <img
                className="button-img"
                src="/images/trash-icon.png"
                alt=""
              ></img>
            </button>
            <label className="upload-img-button" htmlFor="file-upload">
              <img
                className="button-img"
                src="/images/image-icon.png"
                alt=""
              ></img>
            </label>
          </div>
        </div>
      )}
      {selectedStationary !== null && (
        <div className="stationary-container">
          <img className="uploaded-image" src={uploadedStationary} alt={""} />
          <div className="img-buttons">
            <button
              className="delete-img-button"
              onClick={() => deleteImage(2)}
            >
              <img
                className="button-img"
                src="/images/trash-icon.png"
                alt=""
              ></img>
            </button>
            <label
              className="upload-img-button"
              htmlFor="stationary-file-upload"
            >
              <img
                className="button-img"
                src="/images/image-icon.png"
                alt=""
              ></img>
            </label>
          </div>
        </div>
      )}
    </>
  );
}
