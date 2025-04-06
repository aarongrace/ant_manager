import React, { useEffect } from 'react';
import './dashboard.css';
import { makeAnt } from './dashboard.services';
import { useColonyStore } from '../../contexts/colonyStore';

const Dashboard: React.FC = () => {
  const { name: colonyName, ants, eggs, food, sand, age, perkPurchased, fetchColonyInfo } = useColonyStore();

  useEffect(() => {
    fetchColonyInfo();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Panels Container */}
      <div className="panels-container">
        <main className="dashboard-content">
          {/* Colony Overview */}
          <section className="dashboard-section colony-overview">
            <h3>Colony Overview</h3>
            <p><strong>Colony Name:</strong> {colonyName}</p>
            <p><strong>Colony Age:</strong> {age} days</p>
            <p><strong>Number of Ants:</strong> {ants}</p>
            <p><strong>Perks Purchased:</strong> {perkPurchased.join(', ')}</p>
          </section>

          {/* Reproduction Panel */}
          <section className="dashboard-section reproduction-panel">
            <h3>Reproduction Panel</h3>
            <p>Eggs: {eggs}</p>
            <button onClick={() => makeAnt()}>Make Ant</button>
          </section>

          {/* Resource Panel */}
          <section className="dashboard-section resource-panel">
            <h3>Resource Panel</h3>
            <ul>
              <li>Food: {food}</li>
              <li>Sand: {sand}</li>
            </ul>
          </section>

        </main>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <section className="dashboard-section map-panel">
          <h3>Map</h3>
          <div className="map-placeholder">[Map Placeholder]</div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;