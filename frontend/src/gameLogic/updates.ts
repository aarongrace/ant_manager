import { Ant, AntTypeEnum } from "../baseClasses/Ant";
import { EntityTypeEnum, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { SoldierCarryingCapacity, useSettingsStore, WorkerCarryingCapacity } from "../contexts/settingsStore";

export const updateContinuousGameState =  (delta: number) => {
    updateAntMovements(delta);
}

export const updateDiscreteGameState = () => {
    console.log("Updating discrete game state");
    const { ants } = useColonyStore.getState();
    ants.forEach((ant) => {
        if (ant.type != AntTypeEnum.Queen) {
            updateAntDestination(ant);
        }
    });
}


const updateAntMovements = (delta: number) => {
    const { ants, mapEntities } = useColonyStore.getState();

    ants.forEach((ant) =>{
        moveAnt(ant, delta);
        ant.updateSpriteFrame(delta);
    })

}

const moveAnt = (ant: Ant, delta: number) => {
    const mapEntities = useColonyStore.getState().mapEntities;
    const targetEntity = findTargetEntity(ant.destination, mapEntities);
    const speedFactor = 0.0001; // Adjust this value to control the speed of the ant
    if (targetEntity) {
        const dx = targetEntity.position.x - ant.position.x;
        const dy = targetEntity.position.y - ant.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        ant.angle = Math.atan2(dy, dx) + Math.PI/2; // arc tangent to get the angle in radians

        if (distance > 0) {
            ant.position.x += (dx / distance) * speedFactor * delta;
            ant.position.y += (dy / distance) * speedFactor * delta;
        }
    }
}


const updateAntDestination = (ant: Ant) => {
    console.log("Updating ant destination:", ant);
    const { mapEntities } = useColonyStore.getState();
    if (mapEntities.length === 0) {
        console.error("Map entities not available");
    }

    if (ant.destination == ""){
        console.log("Ant has no destination, setting one.");
        setAntDestination(ant, findFirstFoodSource);
    }

    const targetEntity = mapEntities.find(entity => entity.id === ant.destination);


    if (targetEntity &&  detectAntCollision(ant, targetEntity)) {
        console.log("Ant collision detected with target entity:", targetEntity);


        switch (targetEntity.type) {
            case EntityTypeEnum.FoodResource:
                handleAtFoodSource(ant, targetEntity);
                break;
            case EntityTypeEnum.Gateway:
                console.log("Ant reached gateway");
                setAntDestination(ant, findFirstFoodSource);
                break;
            default:
                console.log("Ant reached an unknown entity type");
        }
    }
}

const handleAtFoodSource = (ant: Ant, targetEntity: MapEntity) => {
    console.log("Ant reached food source:", targetEntity);
    const carryingCapacity = ant.type == AntTypeEnum.Soldier ? SoldierCarryingCapacity : WorkerCarryingCapacity;


    if (ant.amountCarried){

    }
    setAntDestination(ant, findGateway);
}


const detectAntCollision = (ant: Ant, targetEntity: MapEntity) => {
    const antCoords = convertPositionToCoords(ant.position);
    const antSize = { width: 40, height: 25 }; // Base size for ants
    const boundingBoxScalingFactor = 8; // the larger the more the ants have to travel towards the center

    const antBoundingBox = {
        left: antCoords.x - antSize.width / boundingBoxScalingFactor,
        top: antCoords.y - antSize.height / boundingBoxScalingFactor,
        right: antCoords.x + antSize.width / boundingBoxScalingFactor,
        bottom: antCoords.y + antSize.height / boundingBoxScalingFactor,
    };
    console.log("Ant bounding box:", antBoundingBox);

    const targetCoords = convertPositionToCoords(targetEntity.position);
    const targetSize = targetEntity.size;
    const targetBoundingBox = {
        left: targetCoords.x - targetSize.width / 2,
        top: targetCoords.y - targetSize.height / 2,
        right: targetCoords.x + targetSize.width / 2,
        bottom: targetCoords.y + targetSize.height / 2,
    };
    console.log("Target bounding box:", targetBoundingBox);

    const horizontalCollision =
        ( antBoundingBox.left <= targetBoundingBox.right && antBoundingBox.right >= targetBoundingBox.left) ||
        (antBoundingBox.right >= targetBoundingBox.left && antBoundingBox.left <= targetBoundingBox.right);
    console.log("Horizontal collision:", horizontalCollision);
    
    const verticalCollision =
        (antBoundingBox.top <= targetBoundingBox.bottom && antBoundingBox.bottom >= targetBoundingBox.top) ||
        (antBoundingBox.bottom >= targetBoundingBox.top && antBoundingBox.top <= targetBoundingBox.bottom);
    console.log("Vertical collision:", verticalCollision);

    return horizontalCollision && verticalCollision;
}

const setAntDestination = (ant: Ant, destinationGetter: (mapEntities: MapEntity[]) => MapEntity | undefined) => {
    const { mapEntities } = useColonyStore.getState();
    const destination = destinationGetter(mapEntities);
    if (destination) {
        ant.destination = destination.id;
        console.log("Ant destination set to:", destination.id);
    } else {
        console.warn("No destination found for the ant.");
    }
}

const findFirstFoodSource = (mapEntities: MapEntity[]) => {
    return mapEntities.find(entity => entity.type === EntityTypeEnum.FoodResource);
}

const findGateway = (mapEntities: MapEntity[]) => {
    return mapEntities.find(entity => entity.type === EntityTypeEnum.Gateway);
}


const findTargetEntity = (id: string, mapEntities: MapEntity[]) => {
    return mapEntities.find(entity => entity.id === id);
}


const convertPositionToCoords = (position: { x: number; y: number })=>{
    const { canvasWidth, canvasHeight } = useSettingsStore.getState();
    return {
        x: position.x * canvasWidth,
        y: position.y * canvasHeight,}
}