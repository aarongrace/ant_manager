import React from "react";
import { Link } from "react-router-dom";
import "./store.css"; // Import the CSS file for styling

const Store = () => {
  return (
    <div className="store-container">
      <h1 className="store-title">Game Store</h1>
      <p className="store-description">
        Purchase cosmetic items and gameplay upgrades to enhance your colony!
      </p>

      {/* Section for cosmetic upgrades */}
      <div className="store-section">
        <h2 className="store-subtitle">Cosmetic Upgrades</h2>
        <ul className="store-list">
          <li className="store-item">
            <span className="store-item-name">Golden Ant Skin</span> - 500 Coins
            <button className="store-buy-button">Buy</button>
          </li>
          <li className="store-item">
            <span className="store-item-name">Shiny Colony Banner</span> - 300 Coins
            <button className="store-buy-button">Buy</button>
          </li>
          <li className="store-item">
            <span className="store-item-name">Custom Ant Trails</span> - 200 Coins
            <button className="store-buy-button">Buy</button>
          </li>
        </ul>
      </div>

      {/* Section for gameplay upgrades */}
      <div className="store-section">
        <h2 className="store-subtitle">Gameplay Upgrades</h2>
        <ul className="store-list">
          <li className="store-item">
            <span className="store-item-name">Ant Speed Boost</span> - 1000 Coins
            <button className="store-buy-button">Buy</button>
          </li>
          <li className="store-item">
            <span className="store-item-name">Increased Food Storage</span> - 800 Coins
            <button className="store-buy-button">Buy</button>
          </li>
          <li className="store-item">
            <span className="store-item-name">Extra Worker Ants</span> - 1200 Coins
            <button className="store-buy-button">Buy</button>
          </li>
        </ul>
      </div>

      <Link to="/dashboard" className="store-back-button">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Store;