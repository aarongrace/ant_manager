import { Ant, AntTypeEnum } from "../baseClasses/Ant";
import { MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { soldierSpeed, workerSpeed } from "../contexts/settingsStore";

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
    const targetEntity = findMapEntity(ant.destination);
    const speedFactor = ant.type === AntTypeEnum.Soldier? soldierSpeed : workerSpeed;

    if (targetEntity) {
        const dx = targetEntity.position.x + ant.targetOffsets.x - ant.position.x;
        const dy = targetEntity.position.y + ant.targetOffsets.y - ant.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        ant.angle = Math.atan2(dy, dx) + Math.PI / 2; // arc tangent to get the angle in radians

        if (distance > 0) {
            ant.position.x += (dx / distance) * speedFactor * delta;
            ant.position.y += (dy / distance) * speedFactor * delta;
        }
    }
};

export const findMapEntity = (id: string) => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.id === id);
};