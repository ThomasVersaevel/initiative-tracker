export function LegendaryTracker() {
  return (
    <div className="col-3 input-container">
      <div className="legendary-container">
        <span>Legendary Actions:</span>
        <div className="checkboxes">
          <label className="custom-checkbox">
            <input type="checkbox" />
            <span className="checkmark"></span>
          </label>
          <label className="custom-checkbox">
            <input type="checkbox" />
            <span className="checkmark"></span>
          </label>
          <label className="custom-checkbox">
            <input type="checkbox" />
            <span className="checkmark"></span>
          </label>
        </div>
      </div>

      <div className="legendary-container">
        <span>Legendary Resistances:</span>
        <div className="checkboxes">
          <label className="custom-checkbox">
            <input type="checkbox" />
            <span className="checkmark"></span>
          </label>
          <label className="custom-checkbox">
            <input type="checkbox" />
            <span className="checkmark"></span>
          </label>
          <label className="custom-checkbox">
            <input type="checkbox" />
            <span className="checkmark"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
