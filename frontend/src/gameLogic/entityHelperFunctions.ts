import { Ant } from "../baseClasses/Ant";
import { EntityTypeEnum, foodSources, MapEntity } from "../baseClasses/MapEntity";
import { Bounds } from "../baseClasses/Models";
import { useColonyStore } from "../contexts/colonyStore";
import { edgeMargin, foodDecayFactor, minDistanceBetweenEntities, useSettingsStore } from "../contexts/settingsStore";

export const findMapEntity = (id: string) => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.id === id);
};

export const findGatewayById = () => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.type === EntityTypeEnum.Gateway); // Use EntityTypeEnum
};

// not in use but do not delete
export const detectAntCollision = (ant: Ant, collisionEntity: MapEntity) => {
    const dx = collisionEntity.coords.x - ant.coords.x;
    const dy = collisionEntity.coords.y - ant.coords.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 50; // Example collision threshold adjusted for absolute coordinates
};

export const findClosestFoodSource = (ant: Ant) => {
    const { mapEntities } = useColonyStore.getState();
    return mapEntities
        .filter((entity) => entity.type === EntityTypeEnum.FoodResource) // Use EntityTypeEnum
        .reduce<{ entity: MapEntity; distance: number } | null>((closest, entity) => {
            const dx = entity.coords.x - ant.coords.x;
            const dy = entity.coords.y - ant.coords.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return !closest || distance < closest.distance
                ? { entity, distance }
                : closest;
        }, null)?.entity;
};

export const findGateway = () => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.type === EntityTypeEnum.Gateway); // Use EntityTypeEnum
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
    const foodSources = mapEntities.filter((entity) => entity.type === EntityTypeEnum.FoodResource);
    foodSources.forEach((foodSource) => {
        if (foodSource.amount > 0) {
            foodSource.amount -= foodDecayFactor;
        }
    });
}

// Helper function to find a random valid position on the map
export const findRandomCoords = (
    minDistance: number=minDistanceBetweenEntities,
    maxAttempts: number = 100
): { x: number; y: number } | null => {
    const { mapEntities } = useColonyStore.getState();
    const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
    const validWidth = canvasWidth - edgeMargin * 3; // Adjusted for absolute coordinates
    const validHeight = canvasHeight - edgeMargin * 3; // Adjusted for absolute coordinates

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const coords = {
            x: Math.random() * validWidth - validWidth / 2,
            y: Math.random() * validHeight- validHeight/ 2,
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
    const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
    let sizeFactor = 1;

    if (entity.type === EntityTypeEnum.FoodResource) {
      const defaultAmount = foodSources.find((source) => source.name === entity.imgName)?.default_amount || 50;
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
  }


  export const drawFruit = (ctx: CanvasRenderingContext2D, row:number, col:number, bounds:Bounds) => {

  }