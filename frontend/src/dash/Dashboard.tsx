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
          <h2>Welcome to the Ant Colony Manager</h2>
          <p> Pay $5 to unlock the full game!</p>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;