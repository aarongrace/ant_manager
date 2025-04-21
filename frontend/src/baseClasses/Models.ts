export interface InteractiveElement{
    getBounds: () => Bounds;    
    onClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    clickable: boolean;
    hoverable: boolean;
    isHovered: boolean;
}


export type Bounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const isWithinBounds = (coords: { x: number; y: number }, bounds: Bounds): boolean => {
  return (
    coords.x >= bounds.left &&
    coords.x <= bounds.left + bounds.width &&
    coords.y >= bounds.top &&
    coords.y <= bounds.top + bounds.height
  );
}