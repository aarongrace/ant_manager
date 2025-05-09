import React, { useEffect } from 'react';
import fall from "../../assets/cursors/fall.png";
import spring from "../../assets/cursors/spring.png";
import summer from "../../assets/cursors/summer.png";
import winter from "../../assets/cursors/winter.png";
import { useColonyStore } from '../../contexts/colonyStore';
import { vars } from '../../contexts/globalVariables'; // Updated to use env
import { updateContinuousGameState } from '../../gameLogic/continuousUpdates';
import { updateDiscreteGameState } from '../../gameLogic/discreteUpdates';
import { handleMouseDown, handleMouseMove, handleMouseUp } from '../../gameLogic/handleMouse';
interface CanvasProps {
  draw: () => void;
  establishContext: (ctx: CanvasRenderingContext2D) => void;
}

const Canvas: React.FC<CanvasProps> = ({ draw, establishContext }) => {
  const { putColonyInfo } = useColonyStore.getState();

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const animationFrameId = React.useRef<number>(0);
  const lastFrameTime = React.useRef<number>(0);
  const lastSyncedTime = React.useRef<number>(0);
  const discreteUpdateTimer = React.useRef<number>(0);

  const animate = (timestamp: number) => {
    const maxDelta = 100; // Cap the delta to avoid large jumps when tabbing back
    const delta = Math.min(timestamp - lastFrameTime.current, maxDelta);
    lastFrameTime.current = timestamp;
    draw();
    updateContinuousGameState(delta);

    discreteUpdateTimer.current += delta;
    if (discreteUpdateTimer.current >= vars.update.discreteUpdateInterval) { // Updated to use env
      updateDiscreteGameState(setCursor);
      discreteUpdateTimer.current -= vars.update.discreteUpdateInterval; // Updated to use env
    }

    if (timestamp - lastSyncedTime.current >= vars.update.syncInterval) { // Updated to use env
      console.log("Syncing colony info at" + timestamp);
      lastSyncedTime.current = timestamp;
      putColonyInfo();
    }

    animationFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    canvasRef.current?.addEventListener('wheel', (e)=>{e.preventDefault()}, { passive: false });
    setCursor();
    lastFrameTime.current = performance.now();
    lastSyncedTime.current = performance.now();
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      establishContext(ctx);
    } else {
      console.error("Canvas context not available");
    }

  }, [canvasRef]);

  const setCursor = () => {
    const cursor = vars.season === 0 ? spring : vars.season === 1 ? summer : vars.season === 2 ? fall : winter;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = `url(${cursor}) 1 1, auto`;
    }
    const panelsContainer = document.getElementById("dashboard-panels-container");
    if (panelsContainer) {
      panelsContainer.style.cursor = `url(${cursor}) 1 1, auto`;
    }
  }

  return (
    <canvas
      ref={canvasRef} tabIndex={0}
      onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
      onMouseMove={(e) => handleMouseMove(e, canvasRef.current!)}
      width={vars.ui.canvasWidth}
      height={vars.ui.canvasHeight}
      
      style={{ width: `${vars.ui.canvasWidth}px`, height: `${vars.ui.canvasHeight}px` }}
      onContextMenu={(e) => e.preventDefault()}
      className="map-canvas"
    />
  );
};

export default Canvas;
