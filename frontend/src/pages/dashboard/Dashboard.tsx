import React, { useEffect } from 'react';
import { AntTypeInfo, AntTypes } from '../../baseClasses/Ant';
import { useIconsStore } from '../../baseClasses/Icon';
import { useColonyStore } from '../../contexts/colonyStore';
import { usePreloadedImagesStore } from '../../contexts/preloadImages';
import { canvasProportions, useSettingsStore } from '../../contexts/settingsStore';
import { initializeAntLogic } from '../../gameLogic/antLogic';
import SurfaceCanvas from '../canvas/Surface';
import './dashboard.css';
import { makeAnt, resetColony } from './dashboard.services';


const Dashboard: React.FC = () => {
  const { name: colonyName, ants, eggs, food, sand, age, perkPurchased, fetchColonyInfo } = useColonyStore();
  const { isLoaded, preloadImages } = usePreloadedImagesStore();
  const { initializeIcons } = useIconsStore();

  useEffect(() => {
    const initialize = async () =>{
      if (!isLoaded) {
        await preloadImages();
      }

      await fetchColonyInfo();
      initializeAntLogic();
      resizeCanvas();
      initializeIcons();
    }
    initialize();
    window.addEventListener('resize', resizeCanvas);
  }, []);

  const resizeCanvas = () => {
    const { setCanvasDimensions } = useSettingsStore.getState();
    setCanvasDimensions(window.innerWidth * canvasProportions.width, window.innerHeight * canvasProportions.height);
  }

  
  const taskCounts = ants.reduce((acc: Record<string, number>, ant) => {
    if (ant.type != AntTypes.Queen) { // queen should not be counted as she technically doesn't have a task
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
            <p><strong>Sand:</strong> {sand}</p>
            <button onClick={()=>resetColony()}>Reset Colony</button>
          </section>

          {/* Reproduction Panel */}
          <section className="dashboard-section reproduction-panel">
            <div className="reproduction-left">
              <h3>Make Ant</h3>
              <p>Eggs: {eggs}</p>
            </div>
            <div className="reproduction-buttons">
              <button onClick={() => makeAnt(AntTypes.Worker)}>+ Worker (-{AntTypeInfo[AntTypes.Worker].cost} food)</button>
              <button onClick={() => makeAnt(AntTypes.Soldier)}>+ Soldier (-{AntTypeInfo[AntTypes.Soldier].cost} food)</button>
            </div>
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