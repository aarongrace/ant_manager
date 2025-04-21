import { Ant, TaskType } from "../baseClasses/Ant";
import { useColonyStore } from "../contexts/colonyStore";
import { vals } from "../contexts/globalVars"; // Updated to use env
import { reignInCoords } from "./antHelperFunctions";
import { initializeAntLogic } from "./antLogic";

export const updateContinuousGameState = (delta: number) => {
    updateAntMovements(delta);
};

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
    if (ant.isAttacking) {
        return;
    }

    reignInCoords(ant.movingTo);

    const { canvasWidth, canvasHeight } = vals.ui; // Updated to use env
    const speedFactor = ant.task === TaskType.Idle ? vals.ant.idleSpeedFactor : 1; // Updated to use env

    const dx = ant.movingTo.x - ant.coords.x;
    const dy = ant.movingTo.y - ant.coords.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2) {
        // Adjusted for absolute coordinates
        return;
    }

    if (!ant.isBusy) {
        // Don't recalculate angle if the ant is busy
        ant.angle = Math.atan2(dy, dx) + Math.PI / 2; // Arc tangent to get the angle in radians
    }

    if (distance > 0) {
        ant.coords.x += (dx / distance) * ant.speed * delta * speedFactor;
        ant.coords.y += (dy / distance) * ant.speed * delta * speedFactor;

        ant.coords.x = Math.max(
            -canvasWidth / 2 + vals.ui.edgeMargin, // Updated to use env
            Math.min(canvasWidth / 2 - vals.ui.edgeMargin, ant.coords.x) // Updated to use env
        );
        ant.coords.y = Math.max(
            -canvasHeight / 2 + vals.ui.edgeMargin, // Updated to use env
            Math.min(canvasHeight / 2 - vals.ui.edgeMargin, ant.coords.y) // Updated to use env
        );
    }
};

export const findMapEntity = (id: string) => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.id === id);
};