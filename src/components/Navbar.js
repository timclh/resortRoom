import React, { useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { FaAlignRight } from "react-icons/fa";
import logo from "../images/logo.svg";

const Navbar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-center">
        <div className="nav-header">
          <Link to="/" aria-label="Beach Resort Home">
            <img src={logo} alt="Beach Resort" />
          </Link>
          <button
            type="button"
            className="nav-btn"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls="nav-links"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <FaAlignRight className="nav-icon" aria-hidden="true" />
          </button>
        </div>
        <ul
          id="nav-links"
          className={isOpen ? "nav-links show-nav" : "nav-links"}
        >
          <li>
            <Link to="/" onClick={closeMenu}>Home</Link>
          </li>
          <li>
            <Link to="/rooms" onClick={closeMenu}>Rooms</Link>
          </li>
          <li>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
});

export default Navbar;
