import { Ant, AntTypeInfo, TaskType } from "../baseClasses/Ant";
import { GameMap } from "../baseClasses/Map";
import { useColonyStore } from "../contexts/colonyStore";
import { vals } from "../contexts/globalVars"; // Updated to use env
import { reignInCoords } from "./antHelperFunctions";
import { initializeAntLogic } from "./antLogic";

export const updateContinuousGameState = (delta: number) => {
    updateAntMovements(delta);
    handleScrolling(delta);
};


const handleScrolling = (delta: number)=>{
    if (vals.ui.scrollDirection.x === 0 && vals.ui.scrollDirection.y === 0) {
        return;
    } else if (vals.ui.remainingScrollDelay > 0){
        vals.ui.remainingScrollDelay-= delta;
        return;
    }

    const epsilon = 30;

    if (vals.ui.scrollDirection.x < 0) {
        GameMap.focalPoint.x = Math.max(
            vals.ui.canvasWidth / 2,
            GameMap.focalPoint.x + vals.ui.scrollSpeed * vals.ui.scrollDirection.x * delta
        );
        if (GameMap.focalPoint.x <= vals.ui.canvasWidth / 2 + epsilon) {
            GameMap.focalPoint.x = vals.ui.canvasWidth / 2;
        }
    } else if (vals.ui.scrollDirection.x > 0) {
        GameMap.focalPoint.x = Math.min(
            GameMap.mapWidth - vals.ui.canvasWidth / 2,
            GameMap.focalPoint.x + vals.ui.scrollSpeed * vals.ui.scrollDirection.x * delta
        );
        if (GameMap.focalPoint.x >= GameMap.mapWidth - vals.ui.canvasWidth / 2 - epsilon) {
            GameMap.focalPoint.x = GameMap.mapWidth - vals.ui.canvasWidth / 2;
        }
    }

    if (vals.ui.scrollDirection.y < 0) {
        GameMap.focalPoint.y = Math.max(
            vals.ui.canvasHeight / 2,
            GameMap.focalPoint.y + vals.ui.scrollSpeed * vals.ui.scrollDirection.y * delta
        );
        if (GameMap.focalPoint.y <= vals.ui.canvasHeight / 2 + epsilon) {
            GameMap.focalPoint.y = vals.ui.canvasHeight / 2;
        }
    } else if (vals.ui.scrollDirection.y > 0) {
        GameMap.focalPoint.y = Math.min(
            GameMap.mapHeight - vals.ui.canvasHeight / 2,
            GameMap.focalPoint.y + vals.ui.scrollSpeed * vals.ui.scrollDirection.y * delta
        );
        if (GameMap.focalPoint.y >= GameMap.mapHeight - vals.ui.canvasHeight / 2 - epsilon) {
            GameMap.focalPoint.y = GameMap.mapHeight - vals.ui.canvasHeight / 2;
        }
    }

    GameMap.cropImageData();
}

const updateAntMovements = (delta: number) => {
    const { ants, enemies } = useColonyStore.getState();

    ants.forEach((ant) => {
        moveAnt(ant, delta);
        ant.updateSpriteFrame(delta);
    });
    enemies.forEach((enemy) => {
        enemy.continuousUpdate(delta);
    });
};

const moveAnt = (ant: Ant, delta: number) => {
    if (ant.movementInitialized === false) {
        initializeAntLogic();
        return;
    }
    reignInCoords(ant.movingTo);

    const speedFactor = ant.task === TaskType.Idle ? vals.ant.idleSpeedFactor : 1; // Updated to use env

    const dx = ant.movingTo.x - ant.coords.x;
    const dy = ant.movingTo.y - ant.coords.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const threshold = ant.task === TaskType.Attack ? AntTypeInfo[ant.type].attackRange - 5 : 2;

    if (!ant.isBusy) {
        // Don't recalculate angle if the ant is busy
        ant.angle = Math.atan2(dy, dx) + Math.PI / 2; // Arc tangent to get the angle in radians
    }

    if (distance < threshold || ant.isAttacking) {
        // Adjusted for absolute coordinates
        return;
    }

    if (distance > 0) {
        ant.coords.x += (dx / distance) * ant.speed * delta * speedFactor;
        ant.coords.y += (dy / distance) * ant.speed * delta * speedFactor;
        reignInCoords(ant.coords);
    }
};

export const findMapEntity = (id: string) => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.id === id);
};