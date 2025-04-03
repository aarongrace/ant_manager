import React from "react";
import { Link } from "react-router-dom";
import "./admin.css"; // Import the CSS file for styling

const Admin = () => {
  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Panel</h1>
      <p className="admin-description">
        Manage the game, players, and settings as an admin.
      </p>

      {/* Section for managing admins */}
      <div className="admin-section">
        <h2 className="admin-subtitle">Manage Admins</h2>
        <form className="admin-form">
          <input
            type="text"
            placeholder="Player Username"
            className="admin-input"
            required
          />
          <button type="submit" className="admin-submit">
            Make Admin
          </button>
        </form>
      </div>

      {/* Section for banning users */}
      <div className="admin-section">
        <h2 className="admin-subtitle">Ban Users</h2>
        <form className="admin-form">
          <input
            type="text"
            placeholder="Player Username"
            className="admin-input"
            required
          />
          <button type="submit" className="admin-submit">
            Ban User
          </button>
        </form>
      </div>

      {/* Section for changing game variables */}
      <div className="admin-section">
        <h2 className="admin-subtitle">Change Game Variables</h2>
        <form className="admin-form">
          <input
            type="text"
            placeholder="Variable Name"
            className="admin-input"
            required
          />
          <input
            type="text"
            placeholder="New Value"
            className="admin-input"
            required
          />
          <button type="submit" className="admin-submit">
            Update Variable
          </button>
        </form>
      </div>

      {/* Section for impersonating players */}
      <div className="admin-section">
        <h2 className="admin-subtitle">Impersonate Players</h2>
        <form className="admin-form">
          <input
            type="text"
            placeholder="Player Username"
            className="admin-input"
            required
          />
          <button type="submit" className="admin-submit">
            Impersonate
          </button>
        </form>
      </div>

      <Link to="/dashboard" className="admin-back-button">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Admin;