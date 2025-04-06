import React, { useEffect } from 'react';
import { drawScene } from './surface.services';
import { useColonyStore } from '../../contexts/colonyStore';

const SurfaceCanvas: React.FC = (props) => {
  const { ants } = useColonyStore();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasWidth = 550;
  const canvasHeight = 400;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (context) {
      drawScene(context, ants);
    }


  });


  return <canvas ref={canvasRef} 
    width = {canvasWidth} height = {canvasHeight} 
    style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
    {...props}/>;
};

export default SurfaceCanvas;
