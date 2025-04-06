import { useColonyStore } from '../../contexts/colonyStore';
import { Ant } from '../../baseClasses/Ant';
import { default as CustomCanvas } from "./Canvas";
import React, { use, useEffect } from 'react';
import bgImgUrl from '../../assets/imgs/bg3.jpg'
import antImgUrl from '../../assets/imgs/ant.png'

export const SurfaceCanvas: React.FC = (props) => {
    const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
    const { ants, updateAnts } = useColonyStore();
    const [ images, setImages ] = React.useState<{ [key: string]: HTMLImageElement }>({});

    useEffect(() => {
        const loadedImages: { [key: string]: HTMLImageElement } = {};
        const imgUrls = [antImgUrl, bgImgUrl];
        imgUrls.forEach((url) => {
            // Extract the filename without the extension
            const filenameWithExtension = url.split('/').pop() || url;
            const filename = filenameWithExtension.split('.')[0]; // Remove the extension
            const img = new Image();
            img.src = url;
            loadedImages[filename] = img;
        });
        setImages(loadedImages);
    }, [])


    const establishContext = (ctx: CanvasRenderingContext2D) => {
        console.log("Establishing context");
        setCtx(ctx);
    }



    function draw(delta: number) {
        console.log("Drawing frame:", delta);
        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            drawBackground(ctx, () => {
                drawAnts(ctx, ants);
            });
            updateAnts(delta);
        } else {
            console.log("in drawing Context not established yet");
        }
    }
    function drawBackground(ctx: CanvasRenderingContext2D, callback: () => void) {
        console.log("Drawing background");
        const bgImage = images["bg3"];
        if (!bgImage) {
            console.error("Background image not loaded");
            return;
        }

        ctx.drawImage(bgImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        callback();
    }

    function drawAnts(ctx: CanvasRenderingContext2D, ants: Ant[]) {
        console.log("Drawing ants:", ants);
        const sizeScaleFactor = { queen: 2, worker: 1, soldier: 1.5 };
        const antSize = { width: 40, height: 25 }; // Base size for ants
        const antImage = images["ant"];

        if (!antImage) {
            console.error("Ant image not loaded");
            return;
        }

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

    return <CustomCanvas draw={draw} establishContext={establishContext} />
}

export default SurfaceCanvas;

