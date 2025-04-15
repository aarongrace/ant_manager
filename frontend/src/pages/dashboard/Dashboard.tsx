import React, { useEffect } from 'react';
import './dashboard.css';
import { makeAnt, resetColony } from './dashboard.services';
import { useColonyStore } from '../../contexts/colonyStore';
import { TaskEnum, AntTypeEnum } from '../../baseClasses/Ant';
import SurfaceCanvas from '../canvas/Surface';


const Dashboard: React.FC = () => {
  const { name: colonyName, ants, eggs, food, sand, age, perkPurchased, fetchColonyInfo } = useColonyStore();

  useEffect(() => {
    fetchColonyInfo();
  }, []);

  
  const taskCounts = ants.reduce((acc: Record<string, number>, ant) => {
    if (ant.type != AntTypeEnum.Queen) { // queen should not be counted as she technically doesn't have a task
      acc[ant.task] = (acc[ant.task] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="dashboard-container">
      {/* Panels Container */}
      <div className="panels-container">
        <main className="dashboard-content">
          {/* Colony Overview */}
          <section className="dashboard-section colony-overview">
            <p><strong>Colony Name:</strong> {colonyName}</p>
            <p><strong>Colony Age:</strong> {age} days</p>
            <p><strong>Number of Ants:</strong> {ants.length}</p>
            <p><strong>Food:</strong> {Math.floor(food)}</p>
            <p><strong>Sand:</strong> {sand}</p>
            <button onClick={()=>resetColony()}>Reset Colony</button>
          </section>

          {/* Reproduction Panel */}
          <section className="dashboard-section reproduction-panel">
            <h3>Reproduction</h3>
            <p>Eggs: {eggs}</p>
            <button onClick={() => makeAnt()}>Make Ant</button>
          </section>

          {/* Resource Panel */}
          <section className="dashboard-section resource-panel">
            <h3>Tasks</h3>
            <ul>
              {Object.entries(taskCounts).map(([task, count]) =>(
                <li key={task}>
                  {task.charAt(0).toUpperCase() + task.slice(1)}: {count}
                </li>
              ))

              }
            </ul>
          </section>

        </main>
      </div>
      <div className="map-container">
        <SurfaceCanvas />
        <p className="map-text">Left click on food source to assign a foraging ant. Right-click it to unassign.</p>
      </div>
    </div>
  );
};

export default Dashboard;