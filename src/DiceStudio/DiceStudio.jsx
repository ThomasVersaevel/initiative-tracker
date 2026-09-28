import { useState } from "react";
import "./DiceStudio.css";
import { Header } from "../Header";

const MAX_OUTCOMES = 2000;
function analyzeDice(notation) {
  const termPattern = /([+-]?)\s*(?:(\d*)\s*d\s*(\d+)|(\d+))/gi;
  const terms = [];
  let cursor = 0;
  let match;

  while ((match = termPattern.exec(notation)) !== null) {
    if (
      notation.slice(cursor, match.index).trim() ||
      (terms.length > 0 && !match[1])
    ) {
      return { error: "Use dice notation like 1d20 or 2d8 + 1d6 + 3." };
    }

    const sign = match[1] === "-" ? -1 : 1;
    if (match[2] !== undefined) {
      const diceCount = Number(match[2] || 1);
      const sides = Number(match[3]);
      if (!Number.isSafeInteger(diceCount) || diceCount < 1) {
        return { error: "Each dice group must contain at least 1 die." };
      }
      if (!Number.isSafeInteger(sides) || sides < 2) {
        return { error: "A die must have at least 2 sides." };
      }
      terms.push({ sign, diceCount, sides });
    } else {
      const modifier = Number(match[4]);
      if (!Number.isSafeInteger(modifier)) {
        return { error: "Modifiers must be safe whole numbers." };
      }
      terms.push({ sign, modifier });
    }
    cursor = termPattern.lastIndex;
  }

  if (
    terms.length === 0 ||
    notation.slice(cursor).trim() ||
    !terms.some((term) => term.diceCount)
  ) {
    return { error: "Use dice notation like 1d20 or 2d8 + 1d6 + 3." };
  }

  const totalDice = terms.reduce(
    (total, term) => total + (term.diceCount || 0),
    0,
  );
  if (totalDice > 100) {
    return { error: "Use between 1 and 100 dice in each expression." };
  }

  const outcomeCount =
    1 +
    terms.reduce(
      (total, term) =>
        total + (term.diceCount ? term.diceCount * (term.sides - 1) : 0),
      0,
    );
  if (outcomeCount > MAX_OUTCOMES) {
    return {
      error: `This roll has too many possible totals to graph (maximum ${MAX_OUTCOMES}).`,
    };
  }

  let probabilities = [1];
  let minimum = 0;
  let expectedValue = 0;
  let variance = 0;

  for (const term of terms) {
    if (term.modifier !== undefined) {
      minimum += term.sign * term.modifier;
      expectedValue += term.sign * term.modifier;
      continue;
    }

    expectedValue += term.sign * term.diceCount * ((term.sides + 1) / 2);
    variance += term.diceCount * ((term.sides ** 2 - 1) / 12);

    for (let die = 0; die < term.diceCount; die += 1) {
      const next = Array(probabilities.length + term.sides - 1).fill(0);
      let windowTotal = 0;

      for (let index = 0; index < next.length; index += 1) {
        if (index < probabilities.length) windowTotal += probabilities[index];
        const expiredIndex = index - term.sides;
        if (expiredIndex >= 0) windowTotal -= probabilities[expiredIndex];
        next[index] = windowTotal / term.sides;
      }

      probabilities = next;
      minimum += term.sign > 0 ? 1 : -term.sides;
    }
  }

  const outcomes = probabilities.map((probability, index) => ({
    value: minimum + index,
    probability,
  }));

  return {
    outcomes,
    expectedValue,
    standardDeviation: Math.sqrt(variance),
    maximumProbability: Math.max(...probabilities),
  };
}

function formatNumber(value) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function DiceStudio({ setPage }) {
  const [notation, setNotation] = useState("10d8");
  const [results, setResults] = useState([]);
  const [formError, setFormError] = useState("");

  const computeRolls = (event) => {
    event.preventDefault();
    const expressions = notation
      .split(/\r?\n/)
      .map((expression) => expression.trim())
      .filter(Boolean);

    if (expressions.length === 0) {
      setResults([]);
      setFormError("Enter at least one dice expression.");
      return;
    }

    setFormError("");
    setResults(
      expressions.map((expression) => ({
        expression,
        analysis: analyzeDice(expression),
      })),
    );
  };

  return (
    <div className="dice-studio">
      <Header
        title="Dice Studio"
        setPage={setPage}
        previousPage={{ page: "character-sheet", label: "Character Sheet" }}
        nextPage={{ page: "initiative-tracker", label: "Initiative Tracker" }}
        className="statblock-page-header"
      />

      <div className="dice-studio__content">
        <form className="dice-studio__form" onSubmit={computeRolls}>
          <label className="dice-studio__field">
            <span className="dice-studio__label">
              Dice notation (1d20), one expression per line
            </span>
            <textarea
              aria-label="Dice notation, one expression per line"
              className="dice-studio__input"
              onChange={(event) => setNotation(event.target.value)}
              placeholder={"I.E. 2d8 + 1d6 + 1d20 + 5"}
              spellCheck="false"
              value={notation}
            />
          </label>
          <button className="dice-studio__compute" type="submit">
            Compute
          </button>
        </form>

        {formError && (
          <p className="dice-studio__error" role="alert">
            {formError}
          </p>
        )}

        {results.length > 0 && (
          <section
            aria-label="Dice expression results"
            className={`dice-studio__results${
              results.length > 1 ? " dice-studio__results--multiple" : ""
            }`}
          >
            {results.map(({ expression, analysis }, resultIndex) => (
              <article
                className="dice-studio__result"
                key={`${resultIndex}-${expression}`}
              >
                {analysis.error ? (
                  <>
                    <h2 className="dice-studio__result-title">{expression}</h2>
                    <p className="dice-studio__error" role="alert">
                      {analysis.error}
                    </p>
                  </>
                ) : (
                  <>
                    <section
                      aria-label={`Computed expression and statistics for ${expression}`}
                      className="dice-studio__stats"
                    >
                      <div className="dice-studio__stat">
                        <span className="dice-studio__stat-label">
                          Computed:
                        </span>
                        <strong className="dice-studio__stat-value dice-studio__stat-value--notation">
                          {expression}
                        </strong>
                      </div>
                      <div className="dice-studio__stat dice-studio__stat--combined">
                        <div>
                          <span className="dice-studio__stat-label">
                            Average (min - max)
                          </span>
                          <strong className="dice-studio__stat-value">
                            {formatNumber(analysis.expectedValue)}
                            <span className="dice-studio__stat-value-sub">
                              {" "} ({formatNumber(analysis.outcomes[0].value)} -{" "}
                              {formatNumber(
                                analysis.outcomes[analysis.outcomes.length - 1]
                                  .value,
                              )}
                              )
                            </span>
                          </strong>
                        </div>
                        <div>
                          <span className="dice-studio__stat-label">
                            Standard deviation
                          </span>
                          <strong className="dice-studio__stat-value">
                            {formatNumber(analysis.standardDeviation)}
                          </strong>
                        </div>
                      </div>
                    </section>

                    <section
                      aria-label={`Probability histogram for ${expression}`}
                      className="dice-studio__chart-panel"
                    >
                      <div className="dice-studio__chart-heading">
                        <h2>Probability by total</h2>
                        <span className="dice-studio__legend">
                          Average
                        </span>
                      </div>
                      <svg
                        aria-label={`Probability histogram for ${expression}`}
                        className="dice-studio__chart"
                        preserveAspectRatio="none"
                        role="img"
                        viewBox="0 0 1000 300"
                      >
                        <line
                          className="dice-studio__baseline"
                          x1="0"
                          x2="1000"
                          y1="280"
                          y2="280"
                        />
                        {analysis.outcomes.map(
                          ({ value, probability }, index) => {
                            const barWidth = 1000 / analysis.outcomes.length;
                            const barHeight =
                              (probability / analysis.maximumProbability) * 250;
                            return (
                              <rect
                                className="dice-studio__bar"
                                key={value}
                                x={index * barWidth + barWidth * 0.04}
                                y={280 - barHeight}
                                width={Math.max(0.5, barWidth * 0.92)}
                                height={barHeight}
                              >
                                <title>{`${value}: ${(probability * 100).toFixed(3)}%`}</title>
                              </rect>
                            );
                          },
                        )}
                        <line
                          className="dice-studio__mean-line"
                          x1={
                            ((analysis.expectedValue -
                              analysis.outcomes[0].value +
                              0.5) /
                              analysis.outcomes.length) *
                            1000
                          }
                          x2={
                            ((analysis.expectedValue -
                              analysis.outcomes[0].value +
                              0.5) /
                              analysis.outcomes.length) *
                            1000
                          }
                          y1="15"
                          y2="280"
                        />
                      </svg>
                      <div className="dice-studio__axis" aria-hidden="true">
                        {analysis.outcomes.map(({ value }, index) => {
                          const labelInterval =
                            analysis.outcomes.length >= 100
                              ? 3
                              : analysis.outcomes.length > 50
                                ? 2
                                : 1;
                          const hideLabel =
                            index % labelInterval !== 0 &&
                            index !== analysis.outcomes.length - 1;

                          return (
                            <span
                              className={
                                hideLabel
                                  ? "dice-studio__axis-label--hidden"
                                  : undefined
                              }
                              key={value}
                            >
                              {value}
                            </span>
                          );
                        })}
                      </div>
                    </section>
                  </>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
