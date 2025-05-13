import React from 'react';
import { Link } from 'react-router-dom'; // You will use react-router-dom for navigation

import './Navbar.css'; // You can style your navbar in a separate CSS file.

function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <h2>School Management</h2>
        </div>

        {/* Navbar Links */}
        <ul className="nav-links">
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/students">Student Management</Link>
          </li>
          <li>
            <Link to="/manage-drives">Vaccination Drives</Link>
          </li>
          <li>
            <Link to="/reports">Reports</Link>
          </li>
          <li>
            <button onClick={onLogout}>Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;