import { useColonyStore } from '../../contexts/colonyStore';
import { Ant } from '../../baseClasses/Ant';
import { default as CustomCanvas } from "./Canvas";
import React, { useEffect } from 'react';
import { MapEntity } from '../../baseClasses/MapEntity';
import { updateGameState } from '../../gameLogic/updates';

// Dynamically import all images from the imgs directory
const importAllImages = (requireContext: __WebpackModuleApi.RequireContext) => {
    const images: string[] = [];
    requireContext.keys().forEach((key) => {
        images.push(requireContext(key));
    });
    return images;
};

const imgUrls = importAllImages(require.context('../../assets/imgs', false, /\.(png|jpe?g|svg)$/));

export const SurfaceCanvas: React.FC = (props) => {
    const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
    const { ants, mapEntities, updateMapEntities } = useColonyStore();
    const [images, setImages] = React.useState<{ [key: string]: HTMLImageElement }>({});

    useEffect(() => {
        const loadedImages: { [key: string]: HTMLImageElement } = {};
        imgUrls.forEach((url) => {
            // Extract the filename without the extension
            const filenameWithExtension = url.split('/').pop() || url;
            const filename = filenameWithExtension.split('.')[0]; // Remove the extension
            const img = new Image();
            img.src = url;
            loadedImages[filename] = img;
        });
        setImages(loadedImages);
    }, []);

    const establishContext = (context: CanvasRenderingContext2D) => {
        console.log("Establishing context");
        setCtx(context);
    };

    function draw(delta: number) {
        // console.log("Drawing frame:", delta);
        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            drawBackground(ctx, () => {
                drawMapEntities(ctx);
                drawAnts(ctx, ants);
            });
            updateGameState(delta);
        } else {
            console.log("in drawing Context not established yet");
        }
    }

    function drawBackground(ctx: CanvasRenderingContext2D, callback: () => void) {
        const bgImage = images["bg3"];
        if (!bgImage) {
            console.error("Background image not loaded");
            return;
        }

        ctx.drawImage(bgImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        callback();
    }

    function drawMapEntities(ctx: CanvasRenderingContext2D) {

        mapEntities.forEach((entity) => {
            const img = images[entity.imgName];
            if (!img) {
                console.error(`Image for entity ${entity.id} not loaded`);
                return;
            }

            const pos_x = entity.position.x * ctx.canvas.width;
            const pos_y = entity.position.y * ctx.canvas.height;

            const left = pos_x - entity.size.width / 2;
            const top = pos_y - entity.size.height / 2;

            ctx.drawImage(img, left, top, entity.size.width, entity.size.height);
        });
    };

    function drawAnts(ctx: CanvasRenderingContext2D, ants: Ant[]) {
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
        });
    }

    return <CustomCanvas draw={draw} establishContext={establishContext} />;
};

export default SurfaceCanvas;

