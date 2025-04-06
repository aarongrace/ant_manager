import bgImgUrl from '../../assets/imgs/bg3.jpg'
import antImgUrl from '../../assets/imgs/ant.png'
import { useColonyStore } from '../../contexts/colonyStore';
import { Ant } from '../../baseClasses/Ant';


function drawBackground(ctx: CanvasRenderingContext2D, callback: () => void) {
    const image = new Image();
    image.src = bgImgUrl;

    image.onload = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
        callback();
    };

    image.onerror = (error) => {
        console.error('Error loading background image:', error);
    };

}

function drawAnts(ctx: CanvasRenderingContext2D, ants: Ant[]) {
    const sizeScaleFactor = { queen: 2, worker: 1, soldier: 1.5 }; 
    const antSize = { width : 40, height: 25 }; // Base size for ants
    const antImage = new Image();
    antImage.src = antImgUrl;

    antImage.onload = () => {
        ants.forEach((ant) => {
            const pos_x = ant.position.x * ctx.canvas.width;
            const pos_y = ant.position.y * ctx.canvas.height;

            const left = pos_x - (antSize.width * sizeScaleFactor[ant.type]) / 2;
            const top = pos_y - (antSize.height * sizeScaleFactor[ant.type]) / 2;
            const width = antSize.width * sizeScaleFactor[ant.type];
            const height = antSize.height * sizeScaleFactor[ant.type];

            ctx.drawImage(antImage, left, top, width, height);
            console.log(pos_x, pos_y);
            console.log("Drawing ant at:", left, top, width, height);

        });
    }
}

export function drawScene(ctx: CanvasRenderingContext2D, ants: Ant[]) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawBackground(ctx, ()=>{
        // putting this in the callback so that the background is drawn first
        drawAnts(ctx, ants);
    });
}