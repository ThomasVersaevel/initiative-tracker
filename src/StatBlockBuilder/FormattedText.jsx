import React from "react";
import { formatLegendaryText } from "./TypesUtils/Types";

const boldExpression = /\b\d+d\d+(?:\s*[+-]\s*\d+)?(?![A-Za-z])|\bDC\s+\d+\s+[A-Za-z]+\b/gi;
const dcExpression = /^DC\s+\d+\s+[A-Za-z]+$/;

export function FormattedText({ text = "", name, amount }) {
  const formattedText = formatLegendaryText(text, name, amount);
  const parts = formattedText.split(boldExpression);
  const matches = formattedText.match(boldExpression) || [];

  return parts.reduce((content, part, index) => {
    content.push(part);
    if (matches[index] && (dcExpression.test(matches[index]) || !/^dc\s+\d+\s+[A-Za-z]+$/i.test(matches[index]))) {
      content.push(
        <strong className="dice-expression" key={`${matches[index]}-${index}`}>
          {matches[index]}
        </strong>,
      );
    } else if (matches[index]) {
      content.push(matches[index]);
    }
    return content;
  }, []);
}