import React from 'react';
import { Ant, AntType, AntTypeInfo, TaskType } from '../../baseClasses/Ant';
import { TaskIcon, useIconsStore } from '../../baseClasses/Icon';
import { GameMap } from '../../baseClasses/Map';
import { Bounds } from '../../baseClasses/Models';
import { useColonyStore } from '../../contexts/colonyStore';
import { vals } from '../../contexts/globalVars'; // Updated to use env
import { usePreloadedImagesStore } from '../../contexts/preloadImages';
import { drawPatrolCircle } from '../../gameLogic/antHelperFunctions';
import { drawDragRectangle } from '../../gameLogic/handleMouse';
import { default as CustomCanvas } from "./Canvas";

export const SurfaceCanvas: React.FC = (props) => {
    const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
    const { ants, mapEntities, enemies } = useColonyStore();
    const { images, isLoaded } = usePreloadedImagesStore();
    const { taskIcons: icons } = useIconsStore();

    const establishContext = (context: CanvasRenderingContext2D) => {
        console.log("Establishing context");
        setCtx(context);
    };

    function draw(delta: number) {
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
        const antSprites = images["ant_sprites"];
        const spriteWidth = 39;
        const spriteWidthIncludingPadding = 66;
        const spriteHeight = 47;

        if (!antSprites) {
            console.error("Ant sprites not loaded");
            return;
        }

        ants.forEach((ant) => {
            const { x: viewportLeft, y: viewportTop } = GameMap.getViewportTopLeft();

            const viewportX = ant.coords.x - viewportLeft;
            const viewportY = ant.coords.y - viewportTop;

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
            const bounds = ant.getBounds();
            const width = bounds.width;
            const height = bounds.height;

            ctx.save();
            ctx.translate(viewportX, viewportY);
            if (ant.hp < AntTypeInfo[ant.type].defaultHp) { // has to be done before rotation
                ant.drawHpBar(ctx);
            };

            if (ant.task === TaskType.Patrol && (vals.highlightedTasks.includes(TaskType.Patrol) || vals.managingPatrol)) {
                drawPatrolCircle(ctx, ant);
            } else if (ant.task === TaskType.Attack && vals.highlightedTasks.includes(TaskType.Attack)) {
                // drawAttackArrow(ctx, ant);
            }

            if (ant.isSelected) {
                ant.drawSelectedCircle(ctx);
            }


            ctx.rotate(ant.angle);
            if (ant.type === AntType.Worker || ant.type === AntType.Soldier) {
                ant.drawSprite(ctx);
            } else {
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
            }

            if (ant.carrying) {
                const carriedObject = ant.carrying;
                const carriedScale = carriedObject.amount / vals.ant.workerCarryingCapacity; // Updated to use env
                const heightOffset = ant.type === AntType.Soldier ? -spriteHeight / 2.2 : -spriteHeight / 2.8;
                ctx.translate(0, heightOffset);
                const carriedBounds: Bounds = {
                    left: -carriedObject.size.width / 2 * carriedScale,
                    top: -carriedObject.size.height / 2 * carriedScale,
                    width: carriedObject.size.width * carriedScale,
                    height: carriedObject.size.height * carriedScale,
                };
                carriedObject.draw(ctx, carriedBounds);
            }

            ctx.restore();
        });
    }

    return <CustomCanvas draw={draw} establishContext={establishContext} />;
};

export default SurfaceCanvas;

