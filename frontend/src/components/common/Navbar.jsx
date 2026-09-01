import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <div className="brand-icon">🌩️</div>
        <span className="brand-title">RITARA</span>
      </NavLink>
      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Live Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/report" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Report Incident
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Admin Portal
          </NavLink>
        </li>
      </ul>
    </header>
  );
}
