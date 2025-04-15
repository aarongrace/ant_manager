import { Ant } from "../baseClasses/Ant";
import { EntityTypeEnum, foodSources, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";

export const findMapEntity = (id: string) => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.id === id);
};

export const findGatewayById = () => {
    const mapEntities = useColonyStore.getState().mapEntities;
    return mapEntities.find((entity) => entity.type === EntityTypeEnum.Gateway); // Use EntityTypeEnum
};

//not in use but do not delete
export const detectAntCollision = (ant: Ant, collisionEntity: MapEntity) => {
    const antPositionAdjustedByOffsets = {
        x: ant.position.x,
        y: ant.position.y,
    };
    const dx = collisionEntity.position.x - antPositionAdjustedByOffsets.x;
    const dy = collisionEntity.position.y - antPositionAdjustedByOffsets.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 0.05; // Example collision threshold
};

export const findClosestFoodSource = (ant: Ant) => {
    const { mapEntities } = useColonyStore.getState();
    return mapEntities
        .filter((entity) => entity.type === EntityTypeEnum.FoodResource) // Use EntityTypeEnum
        .reduce<{ entity: MapEntity; distance: number } | null>((closest, entity) => {
            const dx = entity.position.x - ant.position.x;
            const dy = entity.position.y - ant.position.y;
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
        console.warn("Objective entity not found for ant:", ant);
        return false;
    }
    return true;
};


type Bounds = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export const getEntityBounds = (entity: MapEntity, canvas: HTMLCanvasElement): Bounds => {
    var size_factor = 1;

    if (entity.type === EntityTypeEnum.FoodResource) {
        const defaultAmount = foodSources.find((source) => source.name === entity.imgName)?.default_amount || 50;
        size_factor = entity.remainingAmount / defaultAmount + 0.3;
    }
    const pos_x = entity.position.x * canvas.width;
    const pos_y = entity.position.y * canvas.height;

    const left = pos_x - entity.size.width / 2 * size_factor;
    const top = pos_y - entity.size.height / 2 * size_factor;

    return {
        left: left,
        top: top,
        width: entity.size.width * size_factor,
        height: entity.size.height * size_factor,
    };
};



// Helper function to find a random valid position on the map
export const findRandomPosition = (
  minDistance: number, maxAttempts: number = 100
): { x: number; y: number } | null => {
  const {mapEntities} = useColonyStore.getState();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const position = {
      x: Math.random() * 0.9 + 0.05, // Random x position within the canvas
      y: Math.random() * 0.93 + 0.035, // Random y position within the canvas
    };

    // Check if the position is valid
    const isValid = mapEntities.every((entity) => {
      const dx = entity.position.x - position.x;
      const dy = entity.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance >= minDistance;
    });

    if (isValid) {
      return position; // Return the valid position
    }
  }

  console.warn("No valid position found after maximum attempts.");
  return null; // Return null if no valid position is found
};