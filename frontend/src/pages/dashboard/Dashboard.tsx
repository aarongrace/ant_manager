import React, { useEffect } from 'react';
import ants_icon from '../../assets/imgs/icons/ants_icon.png';
import chitin_icon from '../../assets/imgs/icons/chitin_icon.png';
import eggs_icon from '../../assets/imgs/icons/eggs_icon.png';
import food_icon from '../../assets/imgs/icons/food_icon.png';
import soldier_icon from '../../assets/imgs/icons/soldier_icon.png';
import worker_icon from '../../assets/imgs/icons/worker_icon.png';
import { useColonyStore } from '../../contexts/colonyStore';
import { vars } from '../../contexts/globalVariables';
import { usePreloadedImagesStore } from '../../contexts/preloadImages';
import { initializeAntLogic } from '../../gameLogic/antLogic';
import { AntType, AntTypeInfo } from '../../gameLogic/baseClasses/Ant';
import { handleKeyDown, handleKeyUp } from '../../gameLogic/handleKeyboard';
import GameCanvas from '../canvas/GameCanvas';
import './dashboard.css';
import { makeAnt, resetColony, resizeCanvas } from './dashboard.services';


const Dashboard: React.FC = () => {
  const { ants, eggs, food, chitin, fetchColonyInfo } = useColonyStore();
  const { isLoaded, preloadImages } = usePreloadedImagesStore();

  useEffect(() => {
    if (vars.dashBoardInitialized) { return; }
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
    vars.dashBoardInitialized = true;
  }, []);

  return (
    <div id="dashboard-container">
      {/* Panels Container */}
      <div className="panels-container">
          {/* Colony Overview */}
          <section className="dashboard-section colony-overview">
            <table>
              <tbody>
                <tr> <td className="icon-with-label"><img src={ants_icon} alt="Ants" /> 
                <strong>: </strong> {ants.length}</td> </tr>
                <tr> <td className="icon-with-label"><img src={food_icon} alt="Food" /> 
                <strong>:  </strong> {Math.floor(food)}</td> </tr>
                <tr> <td className="icon-with-label"><img src={chitin_icon} alt="Chitin" /> <strong>:</strong> {Math.ceil(chitin)}</td> </tr>
              </tbody>
            </table>
            <button onClick={()=>resetColony()}>Reset</button>
          </section>

          {/* Reproduction Panel */}
          <section className="dashboard-section reproduction-panel">
              <h3>Hatch eggs!</h3>
            <table>
              <tr><td className='eggs-icon-with-label'><img src ={eggs_icon} alt="Eggs"/>:{eggs}</td></tr>
            <tr className="reproduction-buttons">
              <tr ><td  onClick={() => makeAnt(AntType.Worker)} className='clickable-with-label'><img src={worker_icon}/>({AntTypeInfo[AntType.Worker].cost} food)</td></tr>
              <tr><td  onClick={() => makeAnt(AntType.Soldier)} className='clickable-with-label'><img src={soldier_icon}/> ({AntTypeInfo[AntType.Soldier].cost} food)</td></tr>
              </tr>
            </table>
          </section>
      </div>
      <div className="map-container">
        <GameCanvas />
      </div>
    </div>
  );
};

export default Dashboard;