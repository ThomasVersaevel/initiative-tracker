import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "./Header.css";
import { AccountControl } from "./AccountControl";

export function Header({
  title,
  setPage,
  previousPage,
  nextPage,
  leftContent,
  rightContent,
  className = "",
  children,
}) {
  return (
    <>
      <div className={`App-header ${className}`.trim()}>
        <div className="header-left-cluster">
          {previousPage && (
            <button className="menu-btn" onClick={() => setPage(previousPage.page)}>
              <FontAwesomeIcon icon={faArrowLeft} /> {previousPage.label}
            </button>
          )}
          {leftContent}
        </div>

        <div className="title">
          <h1>{title}</h1>
        </div>

        <div className="header-right-cluster">
          <AccountControl />
          {rightContent}
          {nextPage && (
            <button className="menu-btn" onClick={() => setPage(nextPage.page)}>
              {nextPage.label} <FontAwesomeIcon icon={faArrowRight} />
            </button>
          )}
        </div>
      </div>
      {children}
    </>
  );
}
