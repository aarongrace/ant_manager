import React, { useEffect } from 'react';
import { useColonyStore } from '../../contexts/colonyStore';
import { vals } from '../../contexts/globalVars'; // Updated to use env
import { updateContinuousGameState } from '../../gameLogic/continuousUpdates';
import { updateDiscreteGameState } from '../../gameLogic/discreteUpdates';
import { handleMouseDown, handleMouseMove, handleMouseUp } from '../../gameLogic/handleMouse';

interface CanvasProps {
  draw: (delta: number) => void;
  establishContext: (ctx: CanvasRenderingContext2D) => void;
}

const Canvas: React.FC<CanvasProps> = ({ draw, establishContext }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { putColonyInfo } = useColonyStore();


  const animationFrameId = React.useRef<number>(0);
  const lastFrameTime = React.useRef<number>(0);
  const lastSyncedTime = React.useRef<number>(0);

  const discreteUpdateTimer = React.useRef<number>(0);

  const animate = (timestamp: number) => {
    const delta = timestamp - lastFrameTime.current;
    lastFrameTime.current = timestamp;
    draw(delta);
    updateContinuousGameState(delta);

    discreteUpdateTimer.current += delta;
    if (discreteUpdateTimer.current >= vals.update.discreteUpdateInterval) { // Updated to use env
      updateDiscreteGameState();
      discreteUpdateTimer.current -= vals.update.discreteUpdateInterval; // Updated to use env
    }

    if (timestamp - lastSyncedTime.current >= vals.update.syncInterval) { // Updated to use env
      console.log("Syncing colony info at" + timestamp);
      lastSyncedTime.current = timestamp;
      putColonyInfo();
    }

    animationFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
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

  return (
    <canvas
      ref={canvasRef} tabIndex={0}
      onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
      onMouseMove={(e) => handleMouseMove(e, canvasRef.current!)}
      width={vals.ui.canvasWidth}
      height={vals.ui.canvasHeight}
      style={{ width: `${vals.ui.canvasWidth}px`, height: `${vals.ui.canvasHeight}px` }}
      onContextMenu={(e) => e.preventDefault()}
      className="map-canvas"
    />
  );
};

export default Canvas;
