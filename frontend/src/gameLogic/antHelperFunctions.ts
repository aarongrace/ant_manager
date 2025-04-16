import { Ant, AntTypeEnum, TaskEnum } from "../baseClasses/Ant";
import { EntityTypeEnum, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { edgeMargin, useSettingsStore } from "../contexts/settingsStore";
import { findMapEntity } from "./entityHelperFunctions";

export const findAntByTaskAndOrObjective = (task: TaskEnum, objectiveId: string = ""): Ant | null => {
    const { ants } = useColonyStore.getState();
    for (let ant of ants) {
        if (ant.task === task && ant.type !== AntTypeEnum.Queen && ant.objective !== objectiveId) {
            console.log("Found ant with task:", task);
            return ant;
        }
    }
    return null;
};

export const setAntObjective = (ant: Ant, objective: MapEntity | undefined) => {
    if (!objective) {
        return;
    }
    ant.objective = objective.id;
    setDestination(ant, objective);
    switch (objective.type) {
        case EntityTypeEnum.FoodResource:
            ant.task = TaskEnum.Foraging;
            break;
    }
    ant.isBusy = false;
};

export const setDestination = (ant: Ant, destination: MapEntity | undefined) => {
    if (!destination) {
        return;
    }
    const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
    ant.destination = destination.id;

    const offsetFactor = destination.type === EntityTypeEnum.Gateway ? 50 : 20;

    // Calculate the angle between the ant and the destination
    const dx = destination.coords.x - ant.coords.x;
    const dy = destination.coords.y - ant.coords.y;
    const angle = Math.atan2(dy, dx); // Angle in radians

    const getBiasedRandomCoords = (coord: number, isX: boolean) => {
        const randomOffset = Math.random() - 0.5;
        const bias = isX ? Math.cos(angle) : Math.sin(angle);
        const biasedOffset = (randomOffset - bias * 1.1) * offsetFactor;
        return Math.min(canvasWidth / 2 - edgeMargin, Math.max(-canvasWidth / 2 + edgeMargin, coord + biasedOffset));
    };

    ant.movingTo.x = getBiasedRandomCoords(destination.coords.x, true);
    ant.movingTo.y = getBiasedRandomCoords(destination.coords.y, false);
};

export const findFirstAntByTargetEntity = (entity: MapEntity): Ant | null => {
    const { ants } = useColonyStore.getState();
    for (let ant of ants) {
        if (ant.objective === entity.id) {
            return ant;
        }
    }
    return null;
};

export const setAntToIdle = (ant: Ant) => {
    const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
    ant.task = TaskEnum.Idle;
    ant.objective = "";
    ant.destination = "";
    ant.isBusy = false;

    if (ant.type === AntTypeEnum.Queen) {
        ant.anchorPoint = { ...ant.coords };
        ant.movingTo = { ...ant.anchorPoint };
    } else {
        ant.anchorPoint.x = (canvasWidth / 2 - ant.coords.x) * 0.15 * Math.random() + ant.coords.x;
        ant.anchorPoint.y = (canvasHeight / 2 - ant.coords.y) * 0.1 * Math.random() + ant.coords.y;
        findIdleCoords(ant);
    }
};

export const findIdleCoords = (ant: Ant) => {
    console.log("Finding idle coordinates for ant:", ant);
    const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
    ant.movingTo.x = ant.anchorPoint.x + (Math.random() - 1) * 0.1 * canvasWidth;
    ant.movingTo.y = ant.anchorPoint.y + (Math.random() - 1) * 0.1 * canvasHeight;
    console.log("New idle coordinates:", ant.movingTo);
};

export const hasArrived = (ant: Ant) => {
    const dx = ant.movingTo.x - ant.coords.x;
    const dy = ant.movingTo.y - ant.coords.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 5; // Adjusted for absolute coordinates
};


export const moveWhileBusy = (ant: Ant) => {
    // this function moves ant slightly towards the objective while busy
    const objective = findMapEntity(ant.objective);
    if (objective) {
        var dx = objective.coords.x - ant.coords.x;
        var dy = objective.coords.y - ant.coords.y;
        const randomFactor = Math.random();
        if (randomFactor < 0.3) {
            ant.movingTo.x += dx * 2;
            ant.movingTo.y += dy;
        } else if (randomFactor < 0.6) {
            ant.movingTo.x += dx;
            ant.movingTo.y += dy * 2;
        }
    }
    ant.setAngle();
}