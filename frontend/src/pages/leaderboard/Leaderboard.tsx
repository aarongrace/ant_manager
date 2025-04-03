import React from "react";
import { Link } from "react-router-dom";
import "./leaderboard.css"; // Import the CSS file for styling

const Leaderboard = () => {
  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard</h1>
      <p className="leaderboard-description">
        Check out the top colonies with the most ants in Clash of Colonies!
      </p>
      <ul className="leaderboard-list">
        <li className="leaderboard-item">1. PlayerOne - 100 ants</li>
        <li className="leaderboard-item">2. PlayerTwo - 95 ants</li>
        <li className="leaderboard-item">3. PlayerThree - 90 ants</li>
        <li className="leaderboard-item">4. PlayerFour - 85 ants</li>
        <li className="leaderboard-item">5. PlayerFive - 80 ants</li>
      </ul>
      <Link to="/dashboard" className="leaderboard-back-button">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Leaderboard;