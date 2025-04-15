import { Ant, AntTypeEnum, TaskEnum } from "../baseClasses/Ant";
import { EntityTypeEnum, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { findGateway } from "./entityHelperFunctions";

export const findFirstAntByTask = (task: TaskEnum): Ant | null => {
    const { ants } = useColonyStore.getState();
    for (let ant of ants ){
        if (ant.task === task && ant.type !== AntTypeEnum.Queen) {
            return ant;
        }
    }
    return null;
}

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
    // console.log(`Setting destination for ${ant.id} to ${destination.id}`);
    ant.destination = destination.id;

    const offsetFactor = destination.type === EntityTypeEnum.Gateway ? 0.08 : 0.04;

    // Calculate the angle between the ant and the destination
    const dx = destination.position.x - ant.position.x;
    const dy = destination.position.y - ant.position.y;
    const angle = Math.atan2(dy, dx); // Angle in radians

    const getBiasedRandomPosition = (position: number, isX: boolean) => {
        // Generate a random offset biased by the angle
        const randomOffset = Math.random() - 0.5;

        // Generating a bias so that the ants would stop at the edge of the destination
        const bias = isX ? Math.cos(angle) : Math.sin(angle);
        const biasedOffset = (randomOffset - bias*1.1) * offsetFactor;

        // Clamp the position to ensure it stays within bounds
        return Math.min(0.995, Math.max(0.005, position + biasedOffset));
    };

    // Set the movingTo position with biased randomization
    ant.movingTo.x = getBiasedRandomPosition(destination.position.x, true);
    ant.movingTo.y = getBiasedRandomPosition(destination.position.y, false);

    // console.log("ant.movingTo", ant.movingTo);
};



export const findFirstAntByTargetEntity = (entity: MapEntity): Ant | null => {
    const { ants } = useColonyStore.getState();
    for (let ant of ants ){
        if (ant.objective === entity.id){
            return ant;
        }
    }
    return null;
}

export const setAntToIdle = (ant: Ant) => {
    ant.task = TaskEnum.Idle;
    ant.objective = "";
    ant.destination = "";
    ant.isBusy = false;

    console.log(`Setting ${ant.type} to idle`);

    
    if (ant.type === AntTypeEnum.Queen) {
        ant.anchorPoint = {...ant.position};
        ant.movingTo = {...ant.anchorPoint};
    } else {
        ant.anchorPoint.x = (0.5 - ant.position.x) * 0.15 * Math.random() + ant.position.x;
        ant.anchorPoint.y = (0.5 - ant.position.y) * 0.1 * Math.random() + ant.position.y;
        findIdlePosition(ant);
    }
}

export const findIdlePosition = (ant: Ant) => {
    ant.movingTo.x = ant.anchorPoint.x + (Math.random()-1) * 0.1;
    ant.movingTo.y = ant.anchorPoint.y + (Math.random()-1) * 0.1;
}


export const hasArrived = (ant: Ant) => {
    if (ant.movingTo.x === -1){
        return;
    }
    const dx = ant.movingTo.x - ant.position.x;
    const dy = ant.movingTo.y - ant.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 0.005;
}