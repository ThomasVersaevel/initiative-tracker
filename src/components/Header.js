import "./Header.css";

const themes = [
  { label: "Default", value: "default" },
  { label: "Green", value: "green" },
  { label: "Prisma", value: "prisma" },
  { label: "Dark", value: "dark" },
  { label: "Berry", value: "berry" },
];

export function Header({
  onSelectTheme,
  showSpeed,
  showSpell,
  setShowSpeed,
  setShowSpell,
  showCondition,
  setShowCondition,
}) {
  return (
    <div className="App-header">
      <div className="options-container">
        <label className="form-check-label">
          <input
            type="checkbox"
            className="form-check-input"
            checked={showSpeed}
            onChange={() => setShowSpeed(!showSpeed)}
          />
          Show Speed
        </label>

        <label className="form-check-label">
          <input
            type="checkbox"
            className="form-check-input"
            checked={showSpell}
            onChange={() => setShowSpell(!showSpell)}
          />
          Show Spell Save
        </label>

        <label className="form-check-label">
          <input
            type="checkbox"
            className="form-check-input"
            checked={showCondition}
            onChange={() => setShowCondition(!showCondition)}
          />
          Show Condition
        </label>
      </div>
      <div className="title">
        <h1>Take Initiative</h1>
      </div>

      <div className="class-selector">
        <select
          className="form-control select"
          onChange={(e) => onSelectTheme(e.target.value)}
        >
          {themes.map((option, index) => (
            <option className="option" key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
