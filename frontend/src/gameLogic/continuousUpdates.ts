import { Ant, AntTypeEnum, TaskEnum } from "../baseClasses/Ant";
import { MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { idleSpeedFactor } from "../contexts/settingsStore";
import { setAntToIdle } from "./antHelperFunctions";

export const updateContinuousGameState = (delta: number) => {
    updateAntMovements(delta);
};

const updateAntMovements = (delta: number) => {
    const { ants } = useColonyStore.getState();

    ants.forEach((ant) => {
        moveAnt(ant, delta);
        ant.updateSpriteFrame(delta);
    });
};

const moveAnt = (ant: Ant, delta: number) => {
    if (ant.movingTo.x === -1){
        setAntToIdle(ant);
        return;
    }

    const speedFactor = ant.task === TaskEnum.Idle ? idleSpeedFactor : 1;

    const dx = ant.movingTo.x - ant.position.x;
    const dy = ant.movingTo.y - ant.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 0.005){
        return;
    }

    if (!ant.isBusy) { // don't recalculate angle if the ant is busy
        ant.angle = Math.atan2(dy, dx) + Math.PI / 2; // arc tangent to get the angle in radians
    }

    if (distance > 0) {
        ant.position.x += (dx / distance) * ant.speed * delta * speedFactor;
        ant.position.y += (dy / distance) * ant.speed * delta * speedFactor;

        ant.position.x = Math.max(0.02, Math.min(0.98, ant.position.x));
        ant.position.y = Math.max(0.02, Math.min(0.98, ant.position.y));
    }
};

export const findMapEntity = (id: string) => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.id === id);
};