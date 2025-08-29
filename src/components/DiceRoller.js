import { useRef, useEffect, useState } from "react";
import DiceBox from "@3d-dice/dice-box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DiceRoller({ onResult }) {
  const containerRef = useRef(null);
  const diceBoxRef = useRef(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (containerRef.current && !diceBoxRef.current) {
      const box = new DiceBox("#dice-box", {
        id: "dice-canvas",
        assetPath: "/assets/dice-box/",
        startingHeight: 1,
        throwForce: 1,
        spinForce: 3,
        lightIntensity: 0.8,
      });

      box.init().then(() => {
        diceBoxRef.current = box;
      });
    }
  }, []);

  const rollD20 = () => {
    if (!diceBoxRef.current || rolling) return;
    setRolling(true);

    diceBoxRef.current
      .roll("1d20")
      .then((results) => {
        const total = results[0]?.value ?? null;
        setRolling(false);
        if (onResult) onResult(total);
      })
      .catch(() => {
        setRolling(false);
      });
  };

  return (
    <div>
      <div id="dice-box" ref={containerRef} />
      <button className="btn mt-2" onClick={rollD20} disabled={rolling}>
        <FontAwesomeIcon icon={["fas", "dice-d20"]} />
      </button>
    </div>
  );
}
