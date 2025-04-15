import { Ant, AntTypeEnum } from "../baseClasses/Ant";
import { MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";

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
    const mapEntities = useColonyStore.getState().mapEntities;
    const destinationEntity = findMapEntity(ant.destination);

    if (destinationEntity) {
        const dx = destinationEntity.position.x + ant.destOffsets.x - ant.position.x;
        const dy = destinationEntity.position.y + ant.destOffsets.y - ant.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!ant.isBusy) { // don't recalculate angle if the ant is busy
            ant.angle = Math.atan2(dy, dx) + Math.PI / 2; // arc tangent to get the angle in radians
        }

        if (distance > 0) {
            ant.position.x += (dx / distance) * ant.speed * delta;
            ant.position.y += (dy / distance) * ant.speed * delta;

            // Clamp the position to ensure it stays within [0, 1]
            ant.position.x = Math.max(0, Math.min(1, ant.position.x));
            ant.position.y = Math.max(0, Math.min(1, ant.position.y));
        }
    }
};

export const findMapEntity = (id: string) => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.id === id);
};