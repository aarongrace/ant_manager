import React from 'react';
import { useColonyStore } from '../../contexts/colonyStore';
import { usePreloadedImagesStore } from '../../contexts/preloadImages';
import { Ant } from '../../gameLogic/baseClasses/Ant';
import { TaskIcon, useIconsStore } from '../../gameLogic/baseClasses/Icon';
import { GameMap } from '../../gameLogic/baseClasses/Map';
import { drawDragRectangle } from '../../gameLogic/handleMouse';
import { default as CustomCanvas } from "./Canvas";

export const GameCanvas: React.FC = (props) => {
    const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
    const { ants, mapEntities, enemies } = useColonyStore.getState();
    const { isLoaded } = usePreloadedImagesStore.getState();
    const { taskIcons: icons } = useIconsStore.getState();

    const establishContext = (context: CanvasRenderingContext2D) => {
        console.log("Establishing context");
        setCtx(context);
    };

    function draw() {
        if (!isLoaded) {
            console.error("Images not loaded");
            return;
        }

        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            drawBackground(ctx, () => {
                drawDragRectangle(ctx);
                drawMapEntities(ctx);
                drawAnts(ctx, ants);
                drawEnemies(ctx);
                drawIcons(ctx);

            });
        } else {
            console.log("in drawing Context not established yet");
        }
    }

    function drawIcons(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = "rgba(30, 33, 39, 0.3)";
        const bounds = TaskIcon.getTaskIconAreaBounds();
        ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);
        ctx.restore();
        icons.forEach((icon) => { icon.draw(ctx); });
    }

    function drawBackground(ctx: CanvasRenderingContext2D, callback: () => void) {
        GameMap.drawMap(ctx);
        callback();
    }

    function drawMapEntities(ctx: CanvasRenderingContext2D) {
        mapEntities.forEach((entity) => {
            entity.draw(ctx, entity.getBounds());
        });
    }

    function drawEnemies(ctx: CanvasRenderingContext2D) {
        enemies.forEach((enemy) => {
            enemy.draw(ctx);
        });
    }

    function drawAnts(ctx: CanvasRenderingContext2D, ants: Ant[]) {
        ants.forEach((ant) => {
            ant.draw(ctx);
        });
    }

    return <CustomCanvas draw={draw} establishContext={establishContext} />;
};

export default GameCanvas;

