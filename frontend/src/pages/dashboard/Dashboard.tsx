import React, { useEffect } from 'react';
import { AntType, AntTypeInfo } from '../../baseClasses/Ant';
import { useColonyStore } from '../../contexts/colonyStore';
import { usePreloadedImagesStore } from '../../contexts/preloadImages';
import { initializeAntLogic } from '../../gameLogic/antLogic';
import { handleKeyDown, handleKeyUp } from '../../gameLogic/handleKeyboard';
import SurfaceCanvas from '../canvas/Surface';
import './dashboard.css';
import { makeAnt, resetColony, resizeCanvas } from './dashboard.services';


const Dashboard: React.FC = () => {
  const { name: colonyName, ants, eggs, food, chitin, age, perkPurchased, fetchColonyInfo } = useColonyStore();
  const { isLoaded, preloadImages } = usePreloadedImagesStore();

  useEffect(() => {
    resizeCanvas();
    const initialize = async () =>{
      if (!isLoaded) {
        await preloadImages();
      }

      await fetchColonyInfo();
      initializeAntLogic();
    }
    initialize();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown',handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }, []);


  
  const taskCounts = ants.reduce((acc: Record<string, number>, ant) => {
    if (ant.type != AntType.Queen) { // queen should not be counted as she technically doesn't have a task
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
            <p><strong>Number of Ants:</strong> {ants.length}</p>
            <p><strong>Food:</strong> {Math.floor(food)}</p>
            <p><strong>Chitin:</strong> {chitin}</p>
            <button onClick={()=>resetColony()}>Reset Colony</button>
          </section>

          {/* Reproduction Panel */}
          <section className="dashboard-section reproduction-panel">
            <div className="reproduction-left">
              <h3>Make Ant</h3>
              <p>Eggs: {eggs}</p>
            </div>
            <div className="reproduction-buttons">
              <button onClick={() => makeAnt(AntType.Worker)}>+ Worker (-{AntTypeInfo[AntType.Worker].cost} food)</button>
              <button onClick={() => makeAnt(AntType.Soldier)}>+ Soldier (-{AntTypeInfo[AntType.Soldier].cost} food)</button>
            </div>
          </section>

          {/* Controls Section */}
          <section className="dashboard-section controls-panel">
            <h3>Controls</h3>
            <ul>
              <li>Click on food source to collect</li>
              <li>Right-click to undo</li>
              <li>Hold <strong>Control</strong> to toggle selection</li>
              <li>Drag to select ants</li>
              <li>When selected, click to set target:</li>
              <ul>
                <li>Closest food source when collecting</li>
                <li>Closest enemy when attacking</li>
                <li>Target anchor point when patrolling</li>
              </ul>
              <li>Click on task icons to assign tasks.</li>
            </ul>
          </section>

        </main>
      </div>
      <div className="map-container">
        <SurfaceCanvas />
      </div>
    </div>
  );
};

export default Dashboard;