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
    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImages((prevImages) => [...prevImages, reader.result]);
      setSelectedFile(null);
    };
    reader.readAsDataURL(selectedFile);
  }, [selectedFile, setSelectedFile, setUploadedImages]);

  const handleStationaryUpload = useCallback(() => {
    if (selectedStationary) {
      const reader2 = new FileReader();
      reader2.onloadend = () => {
        setUploadedStationary(reader2.result);
      };
      reader2.readAsDataURL(selectedStationary);
    }
  }, [selectedStationary, setUploadedStationary]);

  const deleteImage = (imageIndex) => {
    if (imageIndex >= 0) {
      setUploadedImages((prevImages) =>
        prevImages.filter((_, index) => index !== imageIndex),
      );
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
      {uploadedImages.length > 0 && (
        <div className="image-gallery">
          {uploadedImages.map((imageSource, index) => (
            <div className="image-container" key={`uploaded-image-${index}`}>
              <img className="uploaded-image" src={imageSource} alt={""} />
              <div className="img-buttons">
                <button
                  className="delete-img-button"
                  onClick={() => deleteImage(index)}
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
          ))}
        </div>
      )}
      {selectedStationary !== null && (
        <div className="stationary-container">
          <img className="uploaded-image" src={uploadedStationary} alt={""} />
          <div className="img-buttons">
            <button
              className="delete-img-button"
              onClick={() => setSelectedStationary(null)}
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
