import { useColonyStore } from "../contexts/colonyStore";
import { vars } from "../contexts/globalVariables"; // Updated to use env
import { Ant } from "./baseClasses/Ant";
import { Fruit } from "./baseClasses/Fruit";
import { GameMap } from "./baseClasses/Map";
import { EntityType, foodSources, MapEntity } from "./baseClasses/MapEntity";
import { Bounds } from "./baseClasses/Models";

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

export const findClosestSource = (coords:{x:number, y:number}, includeChitin = false) => {
    const { mapEntities } = useColonyStore.getState();
    const criteria = includeChitin ? (entity: MapEntity) =>
        entity.type === EntityType.FoodResource || entity.type === EntityType.ChitinSource
        : (entity: MapEntity) => entity.type === EntityType.FoodResource;
    const sources = mapEntities.filter(criteria); 
    const goodEnoughCutoff = 100;

    let closest: {entity: MapEntity, distance: number} | undefined= undefined;
    for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const dx = source.coords.x - coords.x;
        const dy = source.coords.y - coords.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < goodEnoughCutoff) {
            return source;
        } else if (!closest || distance < closest.distance){
            closest = {entity: source, distance: distance};
        }
    }
    return closest?.entity || undefined;
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
    if (!objectiveEntity || objectiveEntity.amount <= 0) {
        // console.warn("Objective entity not found for ant:", ant);
        return false;
    }
    return true;
};

export const decaySources = () => {
    const { mapEntities } = useColonyStore.getState();
    const foodSources = mapEntities.filter((entity) => entity.type === EntityType.FoodResource);
    const decayFactor = vars.food.decayFactor * (1 + foodSources.length * vars.food.decayFactorMultiplier);
    foodSources.forEach((foodSource) => {
        if (foodSource.amount > 0) {
            foodSource.amount -= decayFactor; // Updated to use env
        }
    });
    const chitinSources = mapEntities.filter((entity) => entity.type === EntityType.ChitinSource);
    chitinSources.forEach((chitinSource) => {
        if (chitinSource.amount > 0) {
            chitinSource.amount -= vars.food.decayFactor/20; // chitin has smaller numbers for amounts
        }
    });
};

// Helper function to find a random valid position on the map
export const findValidEntityCoords = (
    minDistance: number = vars.food.minDistanceBetweenEntities, // Updated to use env
    maxAttempts: number = 100
): { x: number; y: number } | null => {
    const { mapEntities } = useColonyStore.getState();
    const { canvasWidth, canvasHeight } = vars.ui; // Updated to use env
    const validWidth = canvasWidth - vars.ui.edgeMargin * 3; // Updated to use env
    const validHeight = canvasHeight - vars.ui.edgeMargin * 3; // Updated to use env
    const viewportTopLeft = GameMap.getViewportTopLeft();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const coords = {
            x: Math.random() * validWidth  + viewportTopLeft.x,
            y: Math.random() * validHeight  + viewportTopLeft.y,
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
    let sizeFactor = 1;
    const viewportTopLeft = GameMap.getViewportTopLeft();

    if (entity.type === EntityType.FoodResource) {
        const defaultAmount = foodSources.find((source) => source.name === entity.imgName)?.default_amount || vars.food.defaultFruitAmount; // Updated to use env
        sizeFactor = entity.amount / defaultAmount + 0.6;
    }

    const posX = entity.coords.x - viewportTopLeft.x;
    const posY = entity.coords.y - viewportTopLeft.y; 

    const left = posX - (entity.size.width / 2) * sizeFactor;
    const top = posY - (entity.size.height / 2) * sizeFactor;

    return {
        left: left,
        top: top,
        width: entity.size.width * sizeFactor,
        height: entity.size.height * sizeFactor,
    };
};

export const getRandomCoordsInViewport = () => {
    const { canvasWidth, canvasHeight } = vars.ui; // Updated to use env
    const viewportTopLeft = GameMap.getViewportTopLeft();
    return {
        x: Math.random() * (canvasWidth - vars.ui.edgeMargin * 2) + (viewportTopLeft.x),
        y: Math.random() * (canvasHeight - vars.ui.edgeMargin * 2) + (viewportTopLeft.y)
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
        return { x: GameMap.center.x, y: GameMap.center.y }; // Default to center if not found
    }
    return nestEntrance.coords;
};

export const ifGrowFruit = () => {
    const { mapEntities } = useColonyStore.getState();
    const foodCount = mapEntities.filter((entity) => entity.type === EntityType.FoodResource).length;
    const k = vars.food.growFruitRateOfDecrease;
    const fruitFactor = Math.exp(-k * (foodCount - 1));
    if (fruitFactor > Math.random()) {
        return true;
    } else {
        return false;
    }
}

export const growFruitAtCoords = (coords: { x: number; y: number }) => {
    const { mapEntities } = useColonyStore.getState();
    const { updateColony } = useColonyStore.getState();
    const fruit = Fruit.createRandomFruit(coords);
    updateColony({ mapEntities: [...mapEntities, fruit] });
}