import React, { useEffect, useState } from "react";

export function NumericInput({
  value,
  onChange,
  onBlur,
  allowEmpty = false,
  ...inputProps
}) {
  const [draft, setDraft] = useState(value ?? "");
  const inputType = inputProps.type ?? "number";

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const handleChange = (event) => {
    setDraft(event.target.value);
    if (event.target.value !== "" || allowEmpty) onChange?.(event);
  };

  const handleBlur = (event) => {
    if (draft === "" && !allowEmpty) {
      const target = {
        name: event.target.name,
        type: "number",
        value: "0",
      };
      setDraft("0");
      onChange?.({ target, currentTarget: target });
    }

    onBlur?.(event);
  };

  const handleWheel = (event) => {
    inputProps.onWheel?.(event);
    if (inputType === "number" && !event.defaultPrevented) {
      event.currentTarget.blur();
    }
  };

  return (
    <input
      {...inputProps}
      type={inputType}
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      onWheel={handleWheel}
    />
  );
}