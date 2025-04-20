export interface InteractiveElement{
    onClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    getBounds: () => Bounds;    
    clickable: boolean;
}


export type Bounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};