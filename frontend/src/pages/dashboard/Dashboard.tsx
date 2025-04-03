import React from 'react';
import './dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>
      <div className="dashboard-body">
        <main className="dashboard-content">
          <p>Manage your colony and dominate the leaderboard!</p>

          {/* Resource Panel */}
          <section className="dashboard-section resource-panel">
            <h3>Resource Panel</h3>
            <ul>
              <li>Food: 500</li>
              <li>Sand: 300</li>
              <li>Ants: 120</li>
            </ul>
          </section>

          {/* Reproduction Panel */}
          <section className="dashboard-section reproduction-panel">
            <h3>Reproduction Panel</h3>
            <p>Eggs: 10</p>
            <button>Make Ant</button>
          </section>

          {/* Map */}
          <section className="dashboard-section map-panel">
            <h3>Map</h3>
            <p>Explore your territory and expand your colony!</p>
            <div className="map-placeholder">[Map Placeholder]</div>
          </section>

          {/* User and Clan Info */}
          <section className="dashboard-section user-clan-info">
            <h3>User and Clan Info</h3>
            <p><strong>Username:</strong> AntMaster123</p>
            <p><strong>Clan:</strong> The Colony Kings</p>
            <p><strong>Rank:</strong> #5 on the leaderboard</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;