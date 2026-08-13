import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StatBlockEditor.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeart,
  faShield,
  faPersonRunning,
  faPlus,
  faWind,
} from "@fortawesome/free-solid-svg-icons";
import { SpeedStore } from "./ItemStore/ItemStore";
import { speedOptions } from "./ItemStore/StoreTypes";

function StatBlockEditor() {
  const [theme, setTheme] = useState("default");
  const [storePanelOpen, setStorePanelOpen] = useState("");

  const [speeds, setSpeeds] = useState([
    {
      type: "walk",
      label: "Walk",
      value: 30,
    },
  ]);

  const [attacks, setAttacks] = useState([]);

  const navigate = useNavigate();

  const [size, setSize] = useState({
    width: 600,
    height: 700,
  });

  const resizing = useRef(false);

  const startResize = (e) => {
    e.preventDefault();
    resizing.current = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e) => {
      if (!resizing.current) return;

      setSize({
        width: Math.max(400, startWidth + (e.clientX - startX)),
        height: Math.max(400, startHeight + (e.clientY - startY)),
      });
    };

    const handleMouseUp = () => {
      resizing.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const getStatBlockData = (form) => {
    const formData = new FormData(form);

    return {
      name: formData.get("name"),
      hp: Number(formData.get("hp")),
      ac: Number(formData.get("ac")),
      speed: Number(formData.get("speed")),
      legendary: formData.get("legendary") === "on",

      stats: {
        str: {
          value: Number(formData.get("str")),
          save: formData.get("strsave"),
        },
        dex: {
          value: Number(formData.get("dex")),
          save: formData.get("dexsave"),
        },
        con: {
          value: Number(formData.get("con")),
          save: formData.get("consave"),
        },
        int: {
          value: Number(formData.get("int")),
          save: formData.get("intsave"),
        },
        wis: {
          value: Number(formData.get("wis")),
          save: formData.get("wissave"),
        },
        cha: {
          value: Number(formData.get("cha")),
          save: formData.get("chasave"),
        },
      },

      size,
      theme,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const action = e.nativeEvent.submitter.value;
    const statBlock = getStatBlockData(e.currentTarget);
    console.log("Action: ", action);

    if (action === "download-json") {
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

    if (action === "download-image") {
      // Image generation later
    }

    if (action === "save") {
      // Database saving later
    }
  };

  return (
    <div className={`stat-block-normal ${theme}`}>
      <div className="App-header statblock-page-header">
        <button className="menu-btn" onClick={() => navigate("/")}>
          <FontAwesomeIcon icon={faArrowLeft} /> Initiative tracker
        </button>
      </div>
      <div className="App-body flex">
        <div
          className="stat-block"
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
          }}
        >
          <form id="stat-block-form" onSubmit={handleSubmit}>
            <div className="standard-row">
              <label>
                Name: <input className="margin-left-6" name="name" />
              </label>
              <label>
                <input name="legendary" type="checkbox" />
                <span className="subtext">Legendary:</span>{" "}
              </label>
            </div>

            <div className="standard-row border-top-3">
              <label>
                <div className="icon-with-text">
                  <FontAwesomeIcon icon={faHeart} />
                  <span>HP</span>
                </div>
                <input className="two-digit-field" name="hp" type="number" />
              </label>

              <label>
                <div className="icon-with-text">
                  <FontAwesomeIcon icon={faShield} />
                  <span>AC</span>
                </div>
                <input className="two-digit-field" name="ac" type="number" />
              </label>

              {speeds.map((speed) => {
                const option = speedOptions.find(
                  (option) => option.type === speed.type,
                );

                return (
                  <label key={speed.type}>
                    <div className="icon-with-text">
                      <FontAwesomeIcon icon={option.icon} />
                    </div>

                    <input
                      className="two-digit-field"
                      name={`speed-${speed.type}`}
                      type="number"
                      defaultValue={speed.value}
                    />
                  </label>
                );
              })}
              <button
                className="btn add-button"
                onClick={() => setStorePanelOpen("speed")}
              >
                Add <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            <div className="stats-row border-top-3">
              {["str", "dex", "con", "int", "wis", "cha"].map((stat) => (
                <label key={stat} className="stat-field">
                  {stat.toUpperCase()}
                  <input
                    className="margin-bottom-4"
                    name={stat}
                    type="number"
                    defaultValue={10}
                  />
                  <input name={`${stat}save`} type="text" defaultValue="+0" />
                </label>
              ))}
            </div>

            <div className="border-top-3"></div>
          </form>
          <div className="resize-handle" onMouseDown={startResize} />
        </div>
        <div className="save-buttons">
          {/* Save to database, save as json data, save as image */}

          <button
            className="btn btn-secondary bot"
            type="submit"
            name="action"
            value="save"
            form="stat-block-form"
          >
            Save Statblock
          </button>
          <button
            className="btn btn-secondary bot"
            type="submit"
            name="action"
            value="download-image"
            form="stat-block-form"
          >
            Download Statblock image
          </button>
          <button
            className="btn btn-secondary bot"
            type="submit"
            name="action"
            value="download-json"
            form="stat-block-form"
          >
            Download Stat JSON data
          </button>
        </div>
      </div>
      {storePanelOpen === "speed" && (
        <SpeedStore
          setStorePanelOpen={setStorePanelOpen}
          speeds={speeds}
          setSpeeds={setSpeeds}
          attacks={attacks}
          setAttacks={setAttacks}
        />
      )}
      <div className="App-footer"></div>
    </div>
  );
}
export default StatBlockEditor;
