import React, { use, useEffect, useRef } from 'react';
import { useColonyStore } from '../../contexts/colonyStore';
import { Ant } from '../../baseClasses/Ant';
import antImgUrl from '../../assets/imgs/ant.png'
import { usePreloadedImages } from '../../contexts/preloadImages';
import { discreteUpdateInterval, useSettingsStore } from '../../contexts/settingsStore';
import { updateContinuousGameState } from '../../gameLogic/continuousUpdates';
import { updateDiscreteGameState } from '../../gameLogic/discreteUpdates';



interface CanvasProps {
  draw: (delta: number) => void;
  establishContext: (ctx: CanvasRenderingContext2D) => void;
}

const Canvas: React.FC <CanvasProps> = ({draw, establishContext}) => {
  


  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { canvasWidth, canvasHeight, syncInterval } = useSettingsStore();

  const { putColonyInfo } = useColonyStore();
  

  const { isLoaded, images } = usePreloadedImages();

  const animationFrameId= React.useRef<number>(0);
  const lastFrameTime = React.useRef<number>(0);
  const lastSyncedTime = React.useRef<number>(0);

  const discreteUpdateTimer = React.useRef<number>(0);


  const animate = (timestamp: number) => {
    // console.log("Animation frame:", timestamp);
    const delta = timestamp - lastFrameTime.current;
    lastFrameTime.current = timestamp;
    draw(delta);
    updateContinuousGameState (delta);

    discreteUpdateTimer.current += delta;
    if (discreteUpdateTimer.current >= discreteUpdateInterval) {
      updateDiscreteGameState();
      discreteUpdateTimer.current -= discreteUpdateInterval;
    }

    if (timestamp - lastSyncedTime.current >= syncInterval) {
      lastSyncedTime.current = timestamp;
      // Sync logic here
      putColonyInfo();
    }

    animationFrameId.current = requestAnimationFrame(animate);
  }

  useEffect(()=> {
    lastFrameTime.current = performance.now();
    lastSyncedTime.current = performance.now();
    animationFrameId.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animationFrameId.current); }
  })
  
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    console.log("Canvas context:", ctx);
    if (ctx) {
      establishContext(ctx);
    } else {
      console.error("Canvas context not available");
    }
  },[ canvasRef ]);

  useEffect(() => {
    console.log("preloading images");
    console.log( isLoaded)
    console.log( images)
  }, [ isLoaded, images ]);

  return <canvas ref={canvasRef} 
    width = {canvasWidth} height = {canvasHeight} 
    style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
    />;
};

export default Canvas;
