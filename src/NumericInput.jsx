import React, { useEffect, useState } from "react";

export function NumericInput({
  value,
  onChange,
  onBlur,
  allowEmpty = false,
  ...inputProps
}) {
  const [draft, setDraft] = useState(value ?? "");

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

  return (
    <input
      {...inputProps}
      type="number"
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}