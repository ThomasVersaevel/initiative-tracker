import React from "react";
import { formatLegendaryText } from "./TypesUtils/Types";

const diceExpression = /\b\d+d\d+(?:\s*[+-]\s*\d+)?(?![A-Za-z])/gi;

export function FormattedText({ text = "", name, amount }) {
  const formattedText = formatLegendaryText(text, name, amount);
  const parts = formattedText.split(diceExpression);
  const matches = formattedText.match(diceExpression) || [];

  return parts.reduce((content, part, index) => {
    content.push(part);
    if (matches[index]) {
      content.push(
        <strong className="dice-expression" key={`${matches[index]}-${index}`}>
          {matches[index]}
        </strong>,
      );
    }
    return content;
  }, []);
}