import { Ant, AntTypeEnum, getCarryingCapacity } from "../baseClasses/Ant";
import { EntityTypeEnum, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { SoldierCarryingCapacity, useSettingsStore, WorkerCarryingCapacity } from "../contexts/settingsStore";
import { findMapEntity } from "./continuousUpdates"; // Import findTargetEntity

export const updateDiscreteGameState = () => {
    console.log("Updating discrete game state");
    const { ants } = useColonyStore.getState();
    ants.forEach((ant) => {
        if (ant.type !== AntTypeEnum.Queen) {
            if (checkIfTargetExists(ant)) {
                checkIfAtTarget(ant);
            } else {
                updateAntDestination(ant);
            }
        }
    });
};

const checkIfTargetExists = (ant: Ant) => {
    if (ant.destination === "") {
        return false;
    }
    const targetEntity = findMapEntity(ant.destination);
    if (!targetEntity) {
        console.warn("Target entity not found for ant:", ant);
        return false;
    }
    return true;
}

const checkIfAtTarget = (ant: Ant) => {
    const targetEntity = findMapEntity(ant.destination); // Use findTargetEntity here

    if (targetEntity && detectAntCollision(ant, targetEntity)) {
        console.log("Ant collision detected with target entity:", targetEntity);

        switch (targetEntity.type) {
            case EntityTypeEnum.FoodResource:
                handleAtFoodSource(ant, targetEntity);
                break;
            case EntityTypeEnum.Gateway:
                handleAtGateway(ant);
                break;
            default:
               console.log("Ant reached an unknown entity type");
        }
    }

}

const updateAntDestination = (ant: Ant) => {
    console.log("Updating ant destination:", ant);

    if (ant.destination === "") {
        console.log("Ant has no destination, setting one.");
        setAntDestination(ant, findFirstFoodSource);
    }
};

const handleAtGateway = (ant: Ant)=>{
    console.log("Ant reached gateway");
    const { food, updateColony } = useColonyStore.getState();
    updateColony({ food: food + ant.amountCarried });
    ant.amountCarried = 0; // Reset the amount carried
    ant.carrying = ""; // Reset the carrying item

    setAntDestination(ant, findFirstFoodSource);
}

const handleAtFoodSource = (ant: Ant, targetEntity: MapEntity) => {
    console.log("Ant reached food source:", targetEntity);

    if (ant.amountCarried < getCarryingCapacity(ant.type)) {
        ant.carrying = targetEntity.imgName;
       ant.amountCarried += 1;
       targetEntity.remainingAmount -= 1;
    } else {
        setAntDestination(ant, findGateway);
    }
};

const detectAntCollision = (ant: Ant, targetEntity: MapEntity) => {
    const antPositionAdjustedByOffsets = {
        x: ant.position.x - ant.targetOffsets.x,
        y: ant.position.y - ant.targetOffsets.y,}
    const antCoords = convertPositionToCoords(antPositionAdjustedByOffsets);
    const antSize = { width: 40, height: 25 }; // Base size for ants
    const boundingBoxScalingFactor = 8; // the larger the more the ants have to travel towards the center

    const antBoundingBox = {
        left: antCoords.x - antSize.width / boundingBoxScalingFactor,
        top: antCoords.y - antSize.height / boundingBoxScalingFactor,
        right: antCoords.x + antSize.width / boundingBoxScalingFactor,
        bottom: antCoords.y + antSize.height / boundingBoxScalingFactor,
    };

    const targetCoords = convertPositionToCoords(targetEntity.position);
    const targetSize = targetEntity.size;
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

const setAntDestination = (
    ant: Ant,
    destinationGetter: (mapEntities: MapEntity[]) => MapEntity | undefined
) => {
    const { canvasHeight, canvasWidth } = useSettingsStore.getState();
    const { mapEntities } = useColonyStore.getState();
    const destination = destinationGetter(mapEntities);
    if (destination) {
        ant.destination = destination.id;
        ant.targetOffsets =  {
            x: (Math.random() - 0.5) * 0.5 * destination.size.width/canvasWidth,
            y: (Math.random() - 0.5) * 0.5 * destination.size.height/canvasHeight,
        }
        console.log("Ant destination set to:", destination.id);
    } else {
        console.warn("No destination found for the ant.");
    }
};

const findFirstFoodSource = (mapEntities: MapEntity[]) => {
    return mapEntities.find((entity) => entity.type === EntityTypeEnum.FoodResource);
};

const findGateway = (mapEntities: MapEntity[]) => {
    return mapEntities.find((entity) => entity.type === EntityTypeEnum.Gateway);
};

const convertPositionToCoords = (position: { x: number; y: number }) => {
    const { canvasWidth, canvasHeight } = useSettingsStore.getState();
    return {
        x: position.x * canvasWidth,
        y: position.y * canvasHeight,
    };
};