import React, { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faDiceD20,
  faChevronDown,
  faAddressCard,
  faFileLines,
  faListCheck,
  faStamp,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import "./Header.css";
import { AccountControl } from "./AccountControl";

const pageLinks = [
  { page: "characters", label: "Characters", icon: faUsers },
  { page: "initiative-tracker", label: "Initiative Tracker", icon: faListCheck },
  { page: "stat-block-builder", label: "Stat Block Builder", icon: faFileLines },
  { page: "token-stamp", label: "Token Stamp", icon: faStamp },
  {
    page: "character-sheet-editor",
    label: "Character Sheet Editor",
    icon: faAddressCard,
  },
  { page: "dice-studio", label: "Dice Studio", icon: faDiceD20 },
];

export function NavigationMenu({ setPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  const navigateToPage = (page) => {
    setIsOpen(false);
    setPage(page);
  };

  return (
    <div
      className="page-navigation"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        className="page-navigation-toggle"
        aria-label="Choose a page"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <FontAwesomeIcon icon={faBars} />
        <span>Pages</span>
        <FontAwesomeIcon icon={faChevronDown} className="page-navigation-chevron" />
      </button>
      {isOpen && (
        <nav
          id={menuId}
          className="page-navigation-menu"
          aria-label="Pages"
        >
          {pageLinks.map(({ page, label, icon }) => (
            <button
              key={page}
              type="button"
              className="page-navigation-link"
              onClick={() => navigateToPage(page)}
            >
              <FontAwesomeIcon
                icon={icon}
                className="page-navigation-link-icon"
                aria-hidden="true"
              />
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export function Header({
  title,
  setPage,
  leftContent,
  rightContent,
  className = "",
  children,
}) {
  return (
    <>
      <div className={`App-header ${className}`.trim()}>
        <div className="header-left-cluster">
          <NavigationMenu setPage={setPage} />
          {leftContent}
        </div>

        <div className="title">
          <h1>{title}</h1>
        </div>

        <div className="header-right-cluster">
          <AccountControl />
          {rightContent}
        </div>
      </div>
      {children}
    </>
  );
}
