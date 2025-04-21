import { TaskIcon, useIconsStore } from "../baseClasses/Icon";
import { InteractiveElement, isWithinBounds } from "../baseClasses/Models";
import { useColonyStore } from "../contexts/colonyStore";

import { debounce } from 'lodash';
import { TaskType } from "../baseClasses/Ant";
import { vals } from "../contexts/globalVars";
import { setAntObjective } from "./antHelperFunctions";
import { findClosestEnemy } from "./enemyHelperFunctions";
import { findClosestFoodSource } from "./entityHelperFunctions";

var hoveredElement: InteractiveElement | null = null;
var isDragging = false;
var dragStart = { x: 0, y: 0 };
var dragEnd = { x: 0, y: 0 };

export const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: worldX, y: worldY } = getWorldCoords(event, event.currentTarget);
    const  coords  = {x: worldX - vals.ui.canvasWidth/2, y: worldY - vals.ui.canvasHeight/2};

    if (vals.managingPatrol && !isDragging){
        isDragging = true;
        dragStart.x = worldX;
        dragStart.y = worldY;
        return;
    }

    const { ants } = useColonyStore.getState();
    ants.forEach((ant) => {
        if (ant.isSelected){
            ant.isSelected = false;
            switch (ant.task){
                case TaskType.Forage:
                    setAntObjective(ant, findClosestFoodSource(coords));
                    break;
                case TaskType.Attack:
                    ant.setEnemy(findClosestEnemy(coords) ?? null);
                    ant.setPatrolAnchor(coords);
                    break;
                case TaskType.Patrol:
                    ant.setPatrolAnchor(coords);
                    break;

            }
        }
    });


    const {  mapEntities, enemies } = useColonyStore.getState();
    const { taskIcons: icons } = useIconsStore.getState();
    const clickedElements: InteractiveElement[] = [
        ...mapEntities.filter((entity) => entity.clickable),
        ...icons.filter((icon) => icon.clickable),
        ...enemies.filter((enemy) => enemy.clickable),
    ];

    clickedElements.forEach((element) => {
        const bounds = element.getBounds();
        if (
            worldX >= bounds.left &&
            worldX <= bounds.left + bounds.width &&
            worldY >= bounds.top &&
            worldY <= bounds.top + bounds.height
        ) {
            element.onClick(event);
            return;
        }
    });

}

const getWorldCoords = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) =>{
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    }
}

export const handleMouseMove = debounce((e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {


    const worldCoords = getWorldCoords(e, canvas);
    if (isDragging) {
        dragEnd.x = worldCoords.x;
        dragEnd.y = worldCoords.y;
        return;
    }

    const { mapEntities } = useColonyStore.getState();
    const { taskIcons } = useIconsStore.getState();

    const hoverableElements: InteractiveElement[] = [
        ...mapEntities.filter((entity) => entity.hoverable),
        ...taskIcons.filter((icon) => icon.hoverable),
    ]


    if (hoveredElement) {
        if (!isWithinBounds(worldCoords, hoveredElement.getBounds())) {
            hoveredElement.isHovered = false;
            if (hoveredElement && hoveredElement instanceof TaskIcon) {
                const hoveredTask = hoveredElement.type;
                vals.highlightedTasks = vals.highlightedTasks.filter((task) => task !== hoveredTask);
            }
            hoveredElement = null;
        }
    } else {
        hoverableElements.forEach((element) => {
            if (isWithinBounds(worldCoords, element.getBounds())) {
                hoveredElement = element;
                if (element instanceof TaskIcon) {
                    const hoveredTask = element.type;
                    vals.highlightedTasks.push(hoveredTask);
                }
                element.isHovered = true;
                return;
            }
        });
    }
},isDragging? 2: 30);

export const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
        isDragging = false;

        const dragBounds = {
            left: Math.min(dragStart.x, dragEnd.x) - vals.ui.canvasWidth/2,
            top: Math.min(dragStart.y, dragEnd.y) - vals.ui.canvasHeight/2,
            width: Math.abs(dragStart.x - dragEnd.x),
            height: Math.abs(dragStart.y - dragEnd.y),
        }
        const { ants } = useColonyStore.getState();
        ants.forEach((ant) => {
            if (isWithinBounds(ant.coords, dragBounds)) {
                console.log("Ant selected");
                ant.isSelected = true;
            }}
        );

    }
}

export const drawDragRectangle = (ctx: CanvasRenderingContext2D) => {
    if (isDragging) {
        console.log("Drawing drag rectangle");
        ctx.save();
        ctx.fillStyle = "rgba(106, 223, 43, 0.3)";
        ctx.strokeStyle = "rgba(15, 61, 97, 0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.rect(
            Math.min(dragStart.x, dragEnd.x),
            Math.min(dragStart.y, dragEnd.y),
            Math.abs(dragStart.x - dragEnd.x),
            Math.abs(dragStart.y - dragEnd.y)
        );
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
}