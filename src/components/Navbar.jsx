import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏷️</span>
          <span className="brand-name">Stickr</span>
        </Link>

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
