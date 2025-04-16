import React from 'react';
import { Ant, AntTypeEnum } from '../../baseClasses/Ant';
import { useColonyStore } from '../../contexts/colonyStore';
import { usePreloadedImagesStore } from '../../contexts/preloadImages';
import { useSettingsStore, workerCarryingCapacity } from '../../contexts/settingsStore';
import { Bounds } from '../../gameLogic/entityHelperFunctions';
import { default as CustomCanvas } from "./Canvas";

export const SurfaceCanvas: React.FC = (props) => {
    const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
    const { ants, mapEntities } = useColonyStore();
    const { images } = usePreloadedImagesStore.getState()
    const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions

    const establishContext = (context: CanvasRenderingContext2D) => {
        console.log("Establishing context");
        setCtx(context);
    };

    function draw(delta: number) {
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
            entity.draw(ctx);
        });
    }

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
            const pos_x = ant.coords.x + canvasWidth / 2;
            const pos_y = ant.coords.y + canvasHeight / 2;

            const spriteY = 0;
            let spriteCol = 0;
            switch (ant.type) {
                case "queen":
                    spriteCol = 2;
                    break;
                case "worker":
                    spriteCol = 0;
                    break;
                case "soldier":
                    spriteCol = 1;
            }
            const spriteX = spriteWidthIncludingPadding * (spriteCol * 3 + ant.frame);
            const width = spriteWidth * sizeScaleFactor[ant.type] * ant.sizeFactor;
            const height = spriteHeight * sizeScaleFactor[ant.type] * ant.sizeFactor;

            ctx.save();
            ctx.translate(pos_x, pos_y);
            ctx.rotate(ant.angle);
            ctx.drawImage(
                antSprites,
                spriteX,
                spriteY,
                spriteWidth,
                spriteHeight,
                -width / 2,
                -height / 2,
                width,
                height
            );

            if (ant.carrying) {
                const carriedObject = ant.carrying;
                const carriedScale = carriedObject.amount / workerCarryingCapacity; // using the worker carrying capacity as a ref
                const heightOffset = ant.type === AntTypeEnum.Soldier ? -spriteHeight / 2.2 : -spriteHeight / 2.8;
                ctx.translate(0, heightOffset);
                const carriedBounds : Bounds = { left: -carriedObject.size.width / 2 * carriedScale, top: -carriedObject.size.height / 2 * carriedScale, width: carriedObject.size.width * carriedScale, height: carriedObject.size.height * carriedScale };
                carriedObject.draw(ctx, carriedBounds);
            }
            ctx.restore();
        });
    }

    return <CustomCanvas draw={draw} establishContext={establishContext} />;
};


export default SurfaceCanvas;

