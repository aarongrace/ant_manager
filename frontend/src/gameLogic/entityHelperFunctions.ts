import { Ant } from "../baseClasses/Ant";
import { EntityType, foodSources, MapEntity } from "../baseClasses/MapEntity";
import { Bounds } from "../baseClasses/Models";
import { useColonyStore } from "../contexts/colonyStore";
import { vals } from "../contexts/globalVars"; // Updated to use env

export const findMapEntity = (id: string) => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.id === id);
};

export const findGatewayById = () => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.type === EntityType.Gateway); // Use EntityTypeEnum
};

// not in use but do not delete
export const detectAntCollision = (ant: Ant, collisionEntity: MapEntity) => {
    const dx = collisionEntity.coords.x - ant.coords.x;
    const dy = collisionEntity.coords.y - ant.coords.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 50; // Example collision threshold adjusted for absolute coordinates
};

export const findClosestFoodSource = (coords:{x:number, y:number}) => {
    const { mapEntities } = useColonyStore.getState();

    return mapEntities
        .filter((entity) => entity.type === EntityType.FoodResource) // Use EntityTypeEnum
        .reduce<{ entity: MapEntity; distance: number } | null>((closest, entity) => {
            const dx = entity.coords.x - coords.x;
            const dy = entity.coords.y - coords.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return !closest || distance < closest.distance
                ? { entity, distance }
                : closest;
        }, null)?.entity;
};

export const findGateway = () => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.type === EntityType.Gateway); // Use EntityTypeEnum
};

export const checkIfObjectiveExists = (ant: Ant) => {
    if (!ant.objective) {
        return false;
    }
    const objectiveEntity = findMapEntity(ant.objective);
    if (!objectiveEntity) {
        // console.warn("Objective entity not found for ant:", ant);
        return false;
    }
    return true;
};

export const decayFoodSource = () => {
    const { mapEntities } = useColonyStore.getState();
    const foodSources = mapEntities.filter((entity) => entity.type === EntityType.FoodResource);
    foodSources.forEach((foodSource) => {
        if (foodSource.amount > 0) {
            foodSource.amount -= vals.food.decayFactor; // Updated to use env
        }
    });
};

// Helper function to find a random valid position on the map
export const findValidEntityCoords = (
    minDistance: number = vals.food.minDistanceBetweenEntities, // Updated to use env
    maxAttempts: number = 100
): { x: number; y: number } | null => {
    const { mapEntities } = useColonyStore.getState();
    const { canvasWidth, canvasHeight } = vals.ui; // Updated to use env
    const validWidth = canvasWidth - vals.ui.edgeMargin * 3; // Updated to use env
    const validHeight = canvasHeight - vals.ui.edgeMargin * 3; // Updated to use env

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const coords = {
            x: Math.random() * validWidth - validWidth / 2,
            y: Math.random() * validHeight - validHeight / 2,
        };

        // Check if the position is valid
        const isValid = mapEntities.every((entity) => {
            const dx = entity.coords.x - coords.x;
            const dy = entity.coords.y - coords.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance >= minDistance;
        });

        if (isValid) {
            return coords; // Return the valid position
        }
    }

    console.warn("No valid position found after maximum attempts.");
    return null; // Return null if no valid position is found
};

// Method to calculate the bounds of the entity
export const getEntityBounds = (entity: MapEntity): Bounds => {
    const { canvasWidth, canvasHeight } = vals.ui; // Updated to use env
    let sizeFactor = 1;

    if (entity.type === EntityType.FoodResource) {
        const defaultAmount = foodSources.find((source) => source.name === entity.imgName)?.default_amount || vals.food.defaultFruitAmount; // Updated to use env
        sizeFactor = entity.amount / defaultAmount + 0.5;
    }

    const posX = entity.coords.x + canvasWidth / 2;
    const posY = entity.coords.y + canvasHeight / 2;

    const left = posX - (entity.size.width / 2) * sizeFactor;
    const top = posY - (entity.size.height / 2) * sizeFactor;

    return {
        left: left,
        top: top,
        width: entity.size.width * sizeFactor,
        height: entity.size.height * sizeFactor,
    };
};

export const getRandomCoords = () => {
    const { canvasWidth, canvasHeight } = vals.ui; // Updated to use env
    return {
        x: Math.random() * (canvasWidth - vals.ui.edgeMargin * 2) - (canvasWidth / 2 - vals.ui.edgeMargin), // Updated to use env
        y: Math.random() * (canvasHeight - vals.ui.edgeMargin * 2) - (canvasHeight / 2 - vals.ui.edgeMargin), // Updated to use env
    };
};

export const calculateDistance = (coord1: { x: number; y: number }, coord2: { x: number; y: number }) => {
    return Math.sqrt(
        Math.pow(coord2.x - coord1.x, 2) + Math.pow(coord2.y - coord1.y, 2)
    );
};

export const getNestEntranceCoords = () => {
    const { mapEntities } = useColonyStore.getState();
    const nestEntrance = mapEntities.find((entity) => entity.type === EntityType.Gateway);
    if (!nestEntrance) {
        return { x: 0, y: 0 }; // Default coordinates if not found
    }
    return nestEntrance.coords;
};