import { TaskIcon, useIconsStore } from "../baseClasses/Icon";
import { InteractiveElement, isWithinBounds } from "../baseClasses/Models";
import { useColonyStore } from "../contexts/colonyStore";

import { debounce } from 'lodash';
import { TaskType } from "../baseClasses/Ant";
import { GameMap } from "../baseClasses/Map";
import { vars } from "../contexts/globalVariables";
import { setAntObjective } from "./antHelperFunctions";
import { findClosestEnemy } from "./enemyHelperFunctions";
import { findClosestSource } from "./entityHelperFunctions";

var hoveredElement: InteractiveElement | null = null;
var isDragging = false;
var dragStart = { x: 0, y: 0 };
var dragEnd = { x: 0, y: 0 };

export const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: viewportX, y: viewportY } = getViewportCoords(event, event.currentTarget);
    const viewportTopLeft = GameMap.getViewportTopLeft();
    const  coords  = {x: viewportX + viewportTopLeft.x, y: viewportY + viewportTopLeft.y};

    if (vars.managingPatrol && !isDragging){
        isDragging = true;
        dragStart.x = viewportX;
        dragStart.y = viewportY;
        return;
    }

    
    // priority 1: change to see if we can select or deselect an ant
    const { ants } = useColonyStore.getState();
    for (let i = 0; i < ants.length; i++) {
        const ant = ants[i];
        if (isWithinBounds({x: viewportX, y: viewportY}, ant.getBounds())){
            console.log("Ant clicked");
            ant.onClick(event);
            return;
        }
    }

    ants.forEach((ant) => {
        if (ant.isSelected){
            ant.isSelected = false;
            switch (ant.task){
                case TaskType.Forage:
                    setAntObjective(ant, findClosestSource(coords));
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
            viewportX >= bounds.left &&
            viewportX <= bounds.left + bounds.width &&
            viewportY >= bounds.top &&
            viewportY <= bounds.top + bounds.height
        ) {
            element.onClick(event);
            return;
        }
    });

}

const getViewportCoords = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) =>{
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    }
}


const handleEdgeMove = (viewportCoords: { x: number; y: number }) =>{
    const { x, y } = viewportCoords;
    const { canvasWidth, canvasHeight } = vars.ui;
    const edgeOffset = 40; // pixels from the edge to start scrolling

    if (isWithinBounds(viewportCoords, TaskIcon.getTaskIconAreaBounds())){
        vars.ui.scrollDirection.x = 0;
        vars.ui.scrollDirection.y = 0;
        vars.ui.remainingScrollDelay = vars.ui.scrollDelay;
        return;
    }

    if (x < edgeOffset) {
        vars.ui.scrollDirection.x = (x - edgeOffset) / edgeOffset;
    } else if (x > canvasWidth - edgeOffset) {
        vars.ui.scrollDirection.x = (x - (canvasWidth - edgeOffset)) / edgeOffset;
    } else {
        vars.ui.scrollDirection.x = 0;
    }

    if (y < edgeOffset) {
        vars.ui.scrollDirection.y = (y - edgeOffset) / edgeOffset;
    }
    else if (y > canvasHeight - edgeOffset) {
        vars.ui.scrollDirection.y = (y - (canvasHeight - edgeOffset)) / edgeOffset;
    } else {
        vars.ui.scrollDirection.y = 0;
    }

    if (vars.ui.scrollDirection.x == 0 && vars.ui.scrollDirection.y == 0) {
        vars.ui.remainingScrollDelay = vars.ui.scrollDelay;
    }
}

export const handleMouseMove = debounce((e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const viewportCoords = getViewportCoords(e, canvas);
    if (isDragging) {
        dragEnd.x = viewportCoords.x;
        dragEnd.y = viewportCoords.y;
        return;
    }

    handleEdgeMove(viewportCoords);

    const { mapEntities } = useColonyStore.getState();
    const { taskIcons } = useIconsStore.getState();

    const hoverableElements: InteractiveElement[] = [
        ...mapEntities.filter((entity) => entity.hoverable),
        ...taskIcons.filter((icon) => icon.hoverable),
    ]
    if (hoveredElement) {
        if (!isWithinBounds(viewportCoords, hoveredElement.getBounds())) {
            hoveredElement.isHovered = false;
            if (hoveredElement && hoveredElement instanceof TaskIcon) {
                const hoveredTask = hoveredElement.type;
                vars.highlightedTasks = vars.highlightedTasks.filter((task: TaskType) => task !== hoveredTask);
            }
            hoveredElement = null;
        }
    } else {
        hoverableElements.forEach((element) => {
            if (isWithinBounds(viewportCoords, element.getBounds())) {
                hoveredElement = element;
                if (element instanceof TaskIcon) {
                    const hoveredTask = element.type;
                    vars.highlightedTasks.push(hoveredTask);
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
        const viewportTopLeft = GameMap.getViewportTopLeft();

        const dragBounds = {
            left: Math.min(dragStart.x, dragEnd.x) + viewportTopLeft.x,
            top: Math.min(dragStart.y, dragEnd.y) + viewportTopLeft.y,
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