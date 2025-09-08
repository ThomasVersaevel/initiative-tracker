import { useRef, useEffect, useState } from "react";
import DiceBox from "@3d-dice/dice-box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiceD20 } from "@fortawesome/free-solid-svg-icons";

export function DiceRoller({ onResult }) {
  const containerRef = useRef(null);
  const diceBoxRef = useRef(null);
  const [notation, setNotation] = useState("1d20");
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState();

  useEffect(() => {
    if (containerRef.current && !diceBoxRef.current) {
      const box = new DiceBox("#dice-box", {
        id: "dice-canvas",
        assetPath: "/assets/dice-box/",
        scale: 6, // adjust up/down to control dice size
        startingHeight: 4,
        throwForce: 6,
        spinForce: 5,
        lightIntensity: 0.9,
      });

      box.init().then(() => {
        diceBoxRef.current = box;
      });
    }
  }, []);

  const rollDice = () => {
    if (!diceBoxRef.current || rolling) return;
    setRolling(true);

    diceBoxRef.current
      .roll(notation)
      .then((results) => {
        setRolling(false);
        const total = results.reduce((sum, r) => sum + (r.value || 0), 0);
        setResult(total);
      })
      .catch(() => setRolling(false));
  };

  return (
    <div
      className="dice-roller"
      style={{
        width: "100%",
        height: "100%",
        border: "3px solid var(--border)",
        background: "var(--row)",
        padding: "1rem",
        flexDirection: "column",
      }}
    >
      <div className="diceroller">
        <input
          type="text"
          value={notation}
          onChange={(e) => setNotation(e.target.value)}
          className="form-control diceroller-input"
          placeholder="1d20"
        />
        <button
          className="btn btn-primary"
          onClick={rollDice}
          disabled={rolling}
        >
          <FontAwesomeIcon icon={faDiceD20} />
        </button>
        <input
          type="text"
          readOnly
          value={result}
          placeholder=""
          className="form-control diceroller-output"
        ></input>
      </div>
      <div id="dice-box" ref={containerRef} />
    </div>
  );
}
