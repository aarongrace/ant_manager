import React, { use, useEffect } from 'react';
import './dashboard.css';
import { makeAnt } from './dashboard.services';
import { useColonyStore } from '../../contexts/colonyStore';

const Dashboard: React.FC = () => {

  const { name: colonyName, ants, eggs, food, sand, age, map, perkPurchased, fetchColonyInfo } = useColonyStore();
  // const colony = colonyStore.item;
  // const { item, fetchItem } = useColonyStore((state) => ({
  //   item: state.item,
  //   fetchItem: state.fetchItem,
  // }));

  useEffect(() => {
    fetchColonyInfo();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>
      <div className="dashboard-body">
        <main className="dashboard-content">
          <p>Manage your colony and dominate the leaderboard!</p>

          {/* Colony Overview */}
          <section className="dashboard-section colony-overview">
        
            <h3>Colony Overview</h3>
            <p><strong>Colony Name:</strong> {colonyName}</p>
            <p><strong>Colony Age:</strong> {age} days</p>
            <p><strong>Number of Ants:</strong> {ants}</p>
            <p><strong>Perks Purchased:</strong> {perkPurchased.join(', ')}</p>
          </section>


          {/* Resource Panel */}
          <section className="dashboard-section resource-panel">
            <h3>Resource Panel</h3>
            <ul>
              <li>Food: {food} </li>
              <li>Sand: {sand} </li>
            </ul>
          </section>

          {/* Reproduction Panel */}
          <section className="dashboard-section reproduction-panel">
            <h3>Reproduction Panel</h3>
            <p>Eggs: {eggs}</p>
            <button onClick={()=>makeAnt()}>Make Ant</button>
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