import React from 'react';
import { Ant, AntTypeEnum } from '../../baseClasses/Ant';
import { useColonyStore } from '../../contexts/colonyStore';
import { usePreloadedImages } from '../../contexts/preloadImages';
import { carriedEntitySize, workerCarryingCapacity } from '../../contexts/settingsStore';
import { getEntityBounds } from '../../gameLogic/entityHelperFunctions';
import { default as CustomCanvas } from "./Canvas";


export const SurfaceCanvas: React.FC = (props) => {
    const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
    const { ants, mapEntities } = useColonyStore();

    const { images } = usePreloadedImages();


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

            const bounds = getEntityBounds(entity, ctx.canvas);

            ctx.drawImage(img, bounds.left, bounds.top, bounds.width, bounds.height);
        });
    };

    function drawAnts(ctx: CanvasRenderingContext2D, ants: Ant[]) {
        const sizeScaleFactor = { queen: 1, worker: 0.5, soldier: 0.7 };
        const antSprites = images["ant_sprites"];
        const spriteWidth = 39;
        const spriteWidthIncludingPadding = 66;
        const spriteHeight = 47;

        if (!antSprites) {
            console.error("Ant sprites not loaded");
            return;
        }

        ants.forEach((ant) => {
            const pos_x = ant.position.x * ctx.canvas.width;
            const pos_y = ant.position.y * ctx.canvas.height;

            const spriteY = 0;
            var spriteCol = 0;
            switch (ant.type) {
                case "queen":
                    spriteCol = 2
                    break;
                case "worker":
                    spriteCol = 0
                    break;
                case "soldier":
                    spriteCol = 1
            }
            const spriteX = spriteWidthIncludingPadding * ( spriteCol * 3 + ant.frame);
            const width = spriteWidth * sizeScaleFactor[ant.type] * ant.sizeFactor;
            const height = spriteHeight * sizeScaleFactor[ant.type] * ant.sizeFactor;


            ctx.save();
            ctx.translate(pos_x, pos_y);
            ctx.rotate(ant.angle);
            ctx.drawImage(antSprites, spriteX, spriteY, spriteWidth, spriteHeight, 
                -width/2, -height/2, width, height);

            if(ant.carrying) {
                const carriedImg = images[ant.carrying];
                if (carriedImg) {
                    const carriedScale =  ant.amountCarried/workerCarryingCapacity; // using the worker carrying capacity as a ref
                    const carriedWidth = carriedEntitySize.width * carriedScale;
                    const carriedHeight = carriedEntitySize.height * carriedScale;
                    const heightOffset = ant.type===AntTypeEnum.Soldier ? -spriteHeight/2.4 : -spriteHeight/3.2;
                    ctx.drawImage(carriedImg, -carriedWidth/2, -carriedHeight/2 + heightOffset, carriedWidth, carriedHeight);
                }
            }
            ctx.restore();

        });
    }

    return <CustomCanvas draw={draw} establishContext={establishContext}/>;
};

export default SurfaceCanvas;

