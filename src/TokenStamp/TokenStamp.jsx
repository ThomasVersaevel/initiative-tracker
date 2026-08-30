import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faEyeDropper,
  faFillDrip,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import "./TokenStamp.css";
import tokenRing from "../assets/tokenRing.png";
import tokenRingShadow from "../assets/tokenRingShadow.png";
import tokenRingDouble from "../assets/TokenRingTwoTone.png";

const SIZE = 700;
const BORDER_RADIUS = SIZE / 2 - 200;
const TOKEN_DIAMETER = BORDER_RADIUS * 2;
const STORAGE_KEY = "tokenStampSettings";
const DEFAULT_BACKGROUND = "#2d384e";
const BORDER_OPTIONS = [
  { label: "Thin metallic", image: tokenRing },
  { label: "Metallic double", image: tokenRingDouble },
  { label: "Thick metallic", image: tokenRingShadow },
];

const normalizeBorderSource = (source) => {
  const legacySources = {
    "token-ring": "0",
    "token-ring-double": "1",
    "token-ring-shadow": "2",
  };
  return legacySources[source] ?? source ?? "0";
};

const readSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const savedSettings = readSettings();

const darkerColor = (hex) => {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((index) =>
    Math.round(Number.parseInt(value.slice(index, index + 2), 16) * 0.72),
  );
  return `rgb(${channels.join(", ")})`;
};

const loadImage = (source, onLoad) => {
  const image = new Image();
  image.onload = () => onLoad(image);
  image.src = source;
};

const fileToDataUrl = (file, onLoad) => {
  const reader = new FileReader();
  reader.onload = () => onLoad(reader.result);
  reader.readAsDataURL(file);
};

const createTokenDataUrl = (canvas) => {
  const output = document.createElement("canvas");
  output.width = SIZE;
  output.height = SIZE;
  const outputContext = output.getContext("2d");
  outputContext.drawImage(canvas, 0, 0);
  outputContext.globalCompositeOperation = "destination-in";
  outputContext.beginPath();
  outputContext.arc(SIZE / 2, SIZE / 2, BORDER_RADIUS, 0, Math.PI * 2);
  outputContext.fill();
  return output.toDataURL("image/png");
};

export default function TokenStamp({ setPage }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const [border, setBorder] = useState(savedSettings.border || "solid");
  const [borderColor, setBorderColor] = useState(
    savedSettings.borderColor || "#d9aa43",
  );
  const [borderAlpha, setBorderAlpha] = useState(
    savedSettings.borderAlpha ?? 1,
  );
  const [background, setBackground] = useState(
    savedSettings.background === "#2a2f3f" ||
      savedSettings.background === "#3b465c" ||
      !savedSettings.background
      ? DEFAULT_BACKGROUND
      : savedSettings.background,
  );
  const [scale, setScale] = useState(savedSettings.scale || 1);
  const [position, setPosition] = useState(
    savedSettings.position || { x: SIZE / 2, y: SIZE / 2 },
  );
  const [hasImage, setHasImage] = useState(false);
  const [borderSource, setBorderSource] = useState(
    normalizeBorderSource(savedSettings.borderSource),
  );
  const [borderImage, setBorderImage] = useState(null);
  const [imageData, setImageData] = useState(savedSettings.imageData || null);
  const [customBorderData, setCustomBorderData] = useState(
    savedSettings.borderImageData || null,
  );
  const [isPickingBackground, setIsPickingBackground] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          border,
          borderColor,
          borderAlpha,
          background,
          scale,
          position,
          borderSource,
          imageData,
          borderImageData: customBorderData,
        }),
      );
    } catch {
      // Keep the editor usable when browser storage is unavailable or full.
    }
  }, [
    border,
    borderColor,
    borderAlpha,
    background,
    scale,
    position,
    borderSource,
    imageData,
    customBorderData,
  ]);

  useEffect(() => {
    if (imageData) {
      loadImage(imageData, (image) => {
        imageRef.current = image;
        setHasImage(true);
      });
    }
  }, [imageData]);

  useEffect(() => {
    const borderIndex = Number.parseInt(borderSource, 10);
    const bundledBorder = Number.isNaN(borderIndex)
      ? null
      : BORDER_OPTIONS[borderIndex]?.image;

    if (!bundledBorder) {
      if (borderSource === "custom" && customBorderData) {
        loadImage(customBorderData, setBorderImage);
      } else {
        setBorderImage(null);
      }
      return undefined;
    }

    const image = new Image();
    image.onload = () => setBorderImage(image);
    image.src = bundledBorder;

    return () => {
      image.onload = null;
    };
  }, [borderSource, customBorderData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const center = SIZE / 2;
    const radius = BORDER_RADIUS;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const image = imageRef.current;
    if (image) {
      const fit =
        Math.min(
          TOKEN_DIAMETER / image.naturalWidth,
          TOKEN_DIAMETER / image.naturalHeight,
        ) * scale;
      const w = image.naturalWidth * fit;
      const h = image.naturalHeight * fit;
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius - 8, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, position.x - w / 2, position.y - h / 2, w, h);
      ctx.restore();
    }

    if (borderSource !== "drawn" && borderImage) {
      ctx.save();
      ctx.globalAlpha = borderAlpha;
      ctx.drawImage(
        borderImage,
        center - TOKEN_DIAMETER / 2,
        center - TOKEN_DIAMETER / 2,
        TOKEN_DIAMETER,
        TOKEN_DIAMETER,
      );
      ctx.restore();
    } else {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 12;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.stroke();
      if (border === "two-tone") {
        ctx.strokeStyle = darkerColor(borderColor);
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(center, center, radius - 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    setPreviewDataUrl(createTokenDataUrl(canvas));
  }, [
    background,
    border,
    borderColor,
    borderAlpha,
    borderSource,
    borderImage,
    position,
    scale,
    hasImage,
  ]);

  const loadTokenFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    loadImage(URL.createObjectURL(file), (image) => {
      imageRef.current = image;
      setPosition({ x: SIZE / 2, y: SIZE / 2 });
      setScale(1);
      setHasImage(true);
    });
    fileToDataUrl(file, setImageData);
  };

  const loadBorderFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    fileToDataUrl(file, (dataUrl) => {
      setBorderSource("custom");
      setCustomBorderData(dataUrl);
    });
    loadImage(URL.createObjectURL(file), setBorderImage);
  };

  const upload = (event) => {
    loadTokenFile(event.target.files && event.target.files[0]);
  };

  const uploadBorder = (event) => {
    loadBorderFile(event.target.files && event.target.files[0]);
  };

  const resize = (event) => {
    if (!resizeRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (SIZE / rect.width);
    const y = (event.clientY - rect.top) * (SIZE / rect.height);
    const distance = Math.hypot(x - position.x, y - position.y);
    setScale(
      Math.max(
        0.1,
        Math.min(
          4,
          (resizeRef.current.scale * distance) / resizeRef.current.distance,
        ),
      ),
    );
  };

  const move = (event) => {
    if (resizeRef.current) {
      resize(event);
      return;
    }
    if (!dragRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const factor = SIZE / rect.width;
    setPosition({
      x: dragRef.current.x + (event.clientX - dragRef.current.clientX) * factor,
      y: dragRef.current.y + (event.clientY - dragRef.current.clientY) * factor,
    });
  };

  const pickBackground = (event) => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = (event.clientX - rect.left) * (SIZE / rect.width);
    const canvasY = (event.clientY - rect.top) * (SIZE / rect.height);
    const fit =
      Math.min(
        TOKEN_DIAMETER / image.naturalWidth,
        TOKEN_DIAMETER / image.naturalHeight,
      ) * scale;
    const imageWidth = image.naturalWidth * fit;
    const imageHeight = image.naturalHeight * fit;
    const imageX = position.x - imageWidth / 2;
    const imageY = position.y - imageHeight / 2;

    if (
      canvasX < imageX ||
      canvasX > imageX + imageWidth ||
      canvasY < imageY ||
      canvasY > imageY + imageHeight
    ) {
      return;
    }

    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = image.naturalWidth;
    sampleCanvas.height = image.naturalHeight;
    const sampleContext = sampleCanvas.getContext("2d");
    sampleContext.drawImage(image, 0, 0);
    const pixel = sampleContext.getImageData(
      Math.floor((canvasX - imageX) / fit),
      Math.floor((canvasY - imageY) / fit),
      1,
      1,
    ).data;

    if (pixel[3] === 0) return;
    setBackground(
      `#${[pixel[0], pixel[1], pixel[2]]
        .map((channel) => channel.toString(16).padStart(2, "0"))
        .join("")}`,
    );
    setIsPickingBackground(false);
  };

  const download = () => {
    const link = document.createElement("a");
    link.download = "dnd-token.png";
    link.href = createTokenDataUrl(canvasRef.current);
    link.click();
  };

  const tokenFit = imageRef.current
    ? Math.min(
        TOKEN_DIAMETER / imageRef.current.naturalWidth,
        TOKEN_DIAMETER / imageRef.current.naturalHeight,
      ) * scale
    : 0;
  const tokenWidth = imageRef.current
    ? imageRef.current.naturalWidth * tokenFit
    : 0;
  const tokenHeight = imageRef.current
    ? imageRef.current.naturalHeight * tokenFit
    : 0;

  return (
    <div className="token-stamp">
      <div className="App-header statblock-page-header">
        <button
          className="menu-btn"
          onClick={() => setPage("stat-block-builder")}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Stat Block Builder
        </button>
        <div className="title">
          <h1>Token Stamp</h1>
        </div>
        <button
          className="menu-btn"
          onClick={() => setPage("initiative-tracker")}
        >
          <FontAwesomeIcon icon={faArrowRight} /> Initiative tracker
        </button>
      </div>

      <section className="App-body token-stamp-body">
        <div className="preview" style={{ gridColumn: "1" }}>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="canvas"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file =
                event.dataTransfer.files && event.dataTransfer.files[0];
              loadTokenFile(file);
            }}
            onPointerDown={(e) => {
              if (isPickingBackground) {
                e.preventDefault();
                pickBackground(e);
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.setPointerCapture(e.pointerId);
              dragRef.current = {
                clientX: e.clientX,
                clientY: e.clientY,
                x: position.x,
                y: position.y,
                rect,
              };
            }}
            onPointerMove={move}
            onPointerUp={() => {
              dragRef.current = null;
              resizeRef.current = null;
            }}
            onPointerCancel={() => {
              dragRef.current = null;
              resizeRef.current = null;
            }}
          />
          {hasImage &&
            ["nw", "ne", "sw", "se"].map((corner) => (
              <span
                key={corner}
                className={`resize-handle resize-${corner}`}
                style={{
                  left: `${
                    ((position.x +
                      (corner.includes("e")
                        ? tokenWidth / 2
                        : -tokenWidth / 2)) /
                      SIZE) *
                    100
                  }%`,
                  top: `${
                    ((position.y +
                      (corner.includes("s")
                        ? tokenHeight / 2
                        : -tokenHeight / 2)) /
                      SIZE) *
                    100
                  }%`,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const rect = canvasRef.current.getBoundingClientRect();
                  const x = (e.clientX - rect.left) * (SIZE / rect.width);
                  const y = (e.clientY - rect.top) * (SIZE / rect.height);
                  resizeRef.current = {
                    distance: Math.max(
                      1,
                      Math.hypot(x - position.x, y - position.y),
                    ),
                    scale,
                  };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={resize}
                onPointerUp={() => {
                  resizeRef.current = null;
                }}
                onPointerCancel={() => {
                  resizeRef.current = null;
                }}
              />
            ))}
          {!hasImage && <span className="hint">Upload an image</span>}
        </div>

        <div className="token-stamp-sidebar">
          <div
            className="controls panel"
            style={{
              gridColumn: "2",
              gridRow: "1",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <label className="border-source-row">
              Border source
              <label
                className="border-source-upload"
                title="Upload custom border"
              >
                <FontAwesomeIcon icon={faUpload} />
                <input
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={uploadBorder}
                />
              </label>
              <select
                value={borderSource}
                onChange={(e) => {
                  const source = e.target.value;
                  setBorderSource(source);
                  if (source === "custom") {
                    setBorderImage(null);
                    setCustomBorderData(null);
                  }
                }}
              >
                <option value="drawn">Drawn colored border</option>
                {BORDER_OPTIONS.map((option, index) => (
                  <option key={option.label} value={index}>
                    {option.label}
                  </option>
                ))}
                <option value="custom">Uploaded border</option>
              </select>
            </label>
            {borderSource === "drawn" && (
              <label>
                Drawn border
                <select
                  value={border}
                  onChange={(e) => setBorder(e.target.value)}
                >
                  <option value="simple">Simple</option>
                  <option value="two-tone">Two-tone</option>
                </select>
              </label>
            )}
            <label>
              Border color
              <span className="color-control" title="Choose drawn border color">
                <FontAwesomeIcon icon={faFillDrip} />
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  aria-label="Drawn border color"
                />
              </span>
            </label>
            <label className="range-control">
              Border alpha <span>{Math.round(borderAlpha * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={borderAlpha}
                onChange={(e) => setBorderAlpha(Number(e.target.value))}
              />
            </label>
            <label className="background-row">
              Background
              <span
                className="color-control"
                title="Choose canvas background color"
              >
                <FontAwesomeIcon icon={faFillDrip} />
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  aria-label="Canvas background color"
                />
              </span>
              <span className="eyedropper-wrap">
                <button
                  type="button"
                  className={`button eyedropper-button${
                    isPickingBackground ? " active" : ""
                  }`}
                  onClick={() => setIsPickingBackground((active) => !active)}
                  disabled={!hasImage}
                  title={
                    isPickingBackground
                      ? "Click the image to pick a color"
                      : "Pick a background color from the uploaded image"
                  }
                  aria-label="Pick background color from image"
                >
                  <FontAwesomeIcon icon={faEyeDropper} />
                </button>
                {isPickingBackground && (
                  <span className="eyedropper-instruction">
                    Click the image to pick a color
                  </span>
                )}
              </span>
            </label>
            <label className="upload">
              Upload image <FontAwesomeIcon icon={faUpload} />
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={upload}
              />
            </label>
            <label className="range-control">
              Image scale <span>{Math.round(scale * 100)}%</span>
              <input
                type="range"
                min=".5"
                max="2.5"
                step=".01"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
            </label>

            <p className="muted">
              Drag inside the preview to reposition your image. Drag a corner to
              resize it.
            </p>
            {previewDataUrl && (
              <>
                <p></p>
                <label>Preview token</label>
                <img
                  className="token-preview"
                  src={previewDataUrl}
                  alt="Live token preview"
                />
              </>
            )}
            <button onClick={download} className="button">
              Download PNG
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
