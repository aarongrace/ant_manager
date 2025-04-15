import { create } from "domain";
import { Ant, AntTypeEnum } from "../baseClasses/Ant";
import { createRandomMapEntity, EntityTypeEnum, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { soldierCarryingCapacity, useSettingsStore, workerCarryingCapacity } from "../contexts/settingsStore";
import { findMapEntity } from "./continuousUpdates"; // Import findTargetEntity



export const updateDiscreteGameState = () => {
    console.log("Updating discrete game state");
    const { ants } = useColonyStore.getState();
    ants.forEach((ant) => {
        if (ant.type !== AntTypeEnum.Queen) {
            checkAndSetAntTarget(ant);
            checkIfAtDestination(ant);
        }
    });
    addRandomMapEntity();
    deleteEmptyMapEntities();
    consumeFood();
};

const consumeFood = () => {
    const { ants, food, updateColony } = useColonyStore.getState();
    const {workerFoodConsumption, soldierFoodConsumption, queenFoodConsumption, foodConsumptionScaleFactor, foodWasteBaseline} = useSettingsStore.getState();
    const wasteFactor = Math.max(0.6, 1 + (food - foodWasteBaseline) / foodWasteBaseline);
    const foodConsumed = Math.floor((ants.reduce((total, ant) => {
        if (ant.type === AntTypeEnum.Worker) {
            return total + workerFoodConsumption ;
        } else if (ant.type === AntTypeEnum.Soldier) {
            return total + soldierFoodConsumption;
        } else if (ant.type === AntTypeEnum.Queen) {
            return total + queenFoodConsumption;
        }
        return total;
    }, 0)) * foodConsumptionScaleFactor * wasteFactor);
    if (food > 0) {
        updateColony({ food: food - foodConsumed });
    } else {
        updateColony({ food: food - foodConsumed });
        console.warn("Not enough food to consume");
    }
}

const deleteEmptyMapEntities = () => {
    const { mapEntities, updateColony } = useColonyStore.getState();
    const nonEmptyMapEntities = mapEntities.filter((entity) => entity.remainingAmount > 0);
    if (nonEmptyMapEntities.length !== mapEntities.length) {
        console.log("Deleting empty map entities");
        updateColony({ mapEntities: nonEmptyMapEntities });
    }
}

const addRandomMapEntity = () => {
    const { entitySpawnFactor } = useSettingsStore.getState();
    const { mapEntities, updateColony } = useColonyStore.getState();

    const numberOfMapEntities = mapEntities.length;
    const probability = 1/Math.pow(numberOfMapEntities + 1, entitySpawnFactor)
    if (Math.random() > probability) { return }
    console.log("Adding random map entity");


    const randomEntity = createRandomMapEntity();

    if (randomEntity) {
        updateColony({
            mapEntities: [...mapEntities, randomEntity],
        })
    }
}


const checkIfTargetExists = (ant: Ant) => {
    if (ant.target === "") {
        return false;
    }
    const targetEntity = findMapEntity(ant.target);
    if (!targetEntity) {
        console.warn("Target entity not found for ant:", ant);
        return false;
    }
    return true;
}

const checkIfAtDestination = (ant: Ant) => {
    const destinationEntity = findMapEntity(ant.destination); // Use findTargetEntity here

    if (destinationEntity && detectAntCollision(ant, destinationEntity)) {
        console.log("Ant collision detected with target entity:", destinationEntity);

        switch (destinationEntity.type) {
            case EntityTypeEnum.FoodResource:
                handleAtFoodSource(ant, destinationEntity);
                break;
            case EntityTypeEnum.Gateway:
                handleAtGateway(ant);
                break;
            default:
               console.log("Ant reached an unknown entity type");
        }
    }

}

const checkAndSetAntTarget = (ant: Ant) => {
    if (ant.target === "" || ! checkIfTargetExists(ant)) {
        console.log("Updating ant target:", ant);
        console.log("Ant has no target, setting one.");

        setAntTarget(ant, findClosetFoodSource(ant));
        
        if (ant.amountCarried == ant.carryingCapacity) {
            setDestToGateway(ant);
        }
        ant.isBusy = false; // Reset the busy state
    } 
};

const handleAtGateway = (ant: Ant)=>{
    console.log("Ant reached gateway");
    const { food, updateColony } = useColonyStore.getState();
    updateColony({ food: food + ant.amountCarried });
    ant.amountCarried = 0; // Reset the amount carried
    ant.carrying = ""; // Reset the carrying item

    checkAndSetAntTarget(ant); // Set a new target
    ant.destination = ant.target; // Set the destination to the new target
}

const handleAtFoodSource = (ant: Ant, foodSource: MapEntity) => {
    console.log("Ant reached food source:", foodSource);
    const isAtCapacity = ant.amountCarried >= ant.carryingCapacity;

    if (foodSource.remainingAmount <= 0 && !isAtCapacity) {
        console.warn("Food source is empty, setting new target.");
        ant.isBusy = false; // Reset the busy state
        setAntTarget(ant, findClosetFoodSource(ant));
    }
     else if (!isAtCapacity) {
       ant.isBusy = true; // Set the ant to busy state
       ant.carrying = foodSource.imgName;
       ant.amountCarried += 1;
       foodSource.remainingAmount -= 1;
    } else {
        ant.isBusy = false; // Reset the busy state
        setDestToGateway(ant);
    }
};

const detectAntCollision = (ant: Ant, collisionEntity: MapEntity) => {
    const antPositionAdjustedByOffsets = {
        x: ant.position.x - ant.destOffsets.x,
        y: ant.position.y - ant.destOffsets.y,}
    const antCoords = convertPositionToCoords(antPositionAdjustedByOffsets);
    const antSize = { width: 40, height: 25 }; // Base size for ants
    const boundingBoxScalingFactor = 8; // the larger the more the ants have to travel towards the center

    const antBoundingBox = {
        left: antCoords.x - antSize.width / boundingBoxScalingFactor,
        top: antCoords.y - antSize.height / boundingBoxScalingFactor,
        right: antCoords.x + antSize.width / boundingBoxScalingFactor,
        bottom: antCoords.y + antSize.height / boundingBoxScalingFactor,
    };

    const targetCoords = convertPositionToCoords(collisionEntity.position);
    const targetSize = collisionEntity.size;
    const targetBoundingBox = {
        left: targetCoords.x - targetSize.width / 2,
        top: targetCoords.y - targetSize.height / 2,
        right: targetCoords.x + targetSize.width / 2,
        bottom: targetCoords.y + targetSize.height / 2,
    };

    const horizontalCollision =
        antBoundingBox.left <= targetBoundingBox.right &&
        antBoundingBox.right >= targetBoundingBox.left;
    const verticalCollision =
        antBoundingBox.top <= targetBoundingBox.bottom &&
        antBoundingBox.bottom >= targetBoundingBox.top;

    return horizontalCollision && verticalCollision;
};


const setAntTarget = ( ant: Ant, target: MapEntity | undefined) => {
    if (!target) { return; }
    if (target) {
        ant.target = target.id;
        ant.destination = target.id;
        resetOffsets(ant);
        console.log("Ant target set to:", target.id);
    } else {
        console.warn("No target found for the ant.");
    }
};

const resetOffsets = (ant: Ant) => {
    ant.destOffsets = {
        x: (Math.random() - 0.5) * 0.5 * ant.destOffsets.x,
        y: (Math.random() - 0.5) * 0.5 * ant.destOffsets.y,
    };
}

const setDestToGateway = (ant: Ant) => {
    const gateway = findGateway();
    if (gateway) {
        ant.destination = gateway.id;
        resetOffsets(ant);
    } else {
        console.warn("No gateway found for the ant to return to.");
    }
}


const findClosetFoodSource = (ant:Ant) => {
    const { mapEntities } = useColonyStore.getState();
    if (mapEntities.length === 0) { return undefined; }
    var closestFoodSource = mapEntities[0];
    var closestDistance = Number.MAX_VALUE;
    mapEntities.forEach((entity) => {
        if (entity.type === EntityTypeEnum.FoodResource) {
            const dx = entity.position.x - ant.position.x;
            const dy = entity.position.y - ant.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if ( distance < closestDistance) {
                closestDistance = distance;
                closestFoodSource = entity;
            }
        }
    });
    return closestFoodSource;
};

const findGateway = () => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.type === EntityTypeEnum.Gateway);
};

const convertPositionToCoords = (position: { x: number; y: number }) => {
    const { canvasWidth, canvasHeight } = useSettingsStore.getState();
    return {
        x: position.x * canvasWidth,
        y: position.y * canvasHeight,
    };
};