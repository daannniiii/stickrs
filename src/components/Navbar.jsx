import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/stickr.logo.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <img src={logoImg} alt="Stickr logo" className="brand-logo" />
          <span className="brand-name">Stickr.</span>
        </Link>

        {/* Center Instagram Link */}
        <a
          href="https://www.instagram.com/stickr.uet"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-insta-banner"
          title="Visit our Instagram @stickr.uet"
        >
          <svg
            className="navbar-insta-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          <span className="navbar-insta-text">
            Order on <strong className="navbar-insta-handle">@stickr.uet</strong>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="navbar-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
            end
          >
            Catalog
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            Contact
          </NavLink>
          <NavLink
            to={isAdmin ? "/admin" : "/admin/login"}
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--admin nav-link--active" : "nav-link nav-link--admin"
            }
          >
            {isAdmin ? "Admin Panel" : "Admin"}
          </NavLink>
        </nav>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <a
            href="https://www.instagram.com/stickr.uet"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-insta-link"
          >
            <svg
              className="navbar-insta-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Order on Instagram (@stickr.uet)
          </a>
          <NavLink
            to="/"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
            end
          >
            Catalog
          </NavLink>
          <NavLink
            to="/about"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </NavLink>
          <NavLink
            to={isAdmin ? "/admin" : "/admin/login"}
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {isAdmin ? "Admin Panel" : "Admin"}
          </NavLink>
        </div>
      )}
    </header>
  );
}
