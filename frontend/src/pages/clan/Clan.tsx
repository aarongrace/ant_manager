import React from "react";
import { Link } from "react-router-dom";
import "./clan.css"; // Import the CSS file for styling

const Clan = () => {
  return (
    <div className="clan-container">
      <h1 className="clan-title">Clan Management</h1>
      <p className="clan-description">
        Manage your clan, initiate trades, and access leader options!
      </p>

      {/* Section for adding clans */}
      <div className="clan-section">
        <h2 className="clan-subtitle">Add a Clan</h2>
        <form className="clan-form">
          <input
            type="text"
            placeholder="Clan Name"
            className="clan-input"
            required
          />
          <button type="submit" className="clan-submit">
            Add Clan
          </button>
        </form>
      </div>

      {/* Section for initiating trades */}
      <div className="clan-section">
        <h2 className="clan-subtitle">Initiate a Trade</h2>
        <form className="clan-form">
          <input
            type="text"
            placeholder="Resource to Trade"
            className="clan-input"
            required
          />
          <input
            type="text"
            placeholder="Amount"
            className="clan-input"
            required
          />
          <button type="submit" className="clan-submit">
            Initiate Trade
          </button>
        </form>
      </div>

      {/* Section for clan leader options */}
      <div className="clan-section">
        <h2 className="clan-subtitle">Leader Options</h2>
        <ul className="clan-leader-options">
          <li>Promote a member to co-leader</li>
          <li>Kick a member from the clan</li>
          <li>Set clan trade policies</li>
        </ul>
      </div>

      <Link to="/dashboard" className="clan-back-button">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Clan;