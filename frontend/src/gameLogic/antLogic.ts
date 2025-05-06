import { v4 } from "uuid";
import { useColonyStore } from "../contexts/colonyStore";
import { vars } from "../contexts/globalVariables"; // Updated to use env
import { checkIfAtCapacity, findIdleCoords, findNewPatrolCoords, hasArrived, moveWhileBusy, setAntObjective, setAntToIdle, setDestination, startPatrol } from "./antHelperFunctions";
import { Ant, AntType, TaskType } from "./baseClasses/Ant";
import { Enemy } from "./baseClasses/Enemy";
import { Fruit } from "./baseClasses/Fruit";
import { GameMap } from "./baseClasses/Map";
import { EntityType, MapEntity } from "./baseClasses/MapEntity";
import { findEnemyByCondition } from "./enemyHelperFunctions";
import { calculateDistance, findClosestSource, findGateway, findMapEntity, checkIfObjectiveExists as hasValidObjective } from "./entityHelperFunctions";

//todo add capability to draw multiple carried entities

export const handleAntLogic = (ant: Ant) => {
    if (ant.task === TaskType.Forage) { handleForage(ant);
    } else if (ant.task === TaskType.Idle) { handleIdling(ant);
    } else if (ant.task === TaskType.Attack) { handleAttack(ant);
    } else if (ant.task === TaskType.Patrol) { handlePatrol(ant); }
};

// this is crucial because movingTo, anchorPoints and etc. are not stored in the backend
export const initializeAntLogic = () => {
    const { ants } = useColonyStore.getState();
    ants.forEach((ant) => {

        switch (ant.task) {
            case TaskType.Forage:
                if (!hasValidObjective(ant)) {
                    // if they are carrying chitin already, just go home so that they don't collect food on the way home
                    if (ant.carriedEntity && ant.carriedEntity.type === EntityType.ChitinSource) {
                        setAntObjective(ant,findGateway());
                    } else {
                    // otherwise, set the objective to the closest source
                        setAntObjective(ant, findClosestSource(ant.coords, true));
                    }
                } else {
                    setDestination(ant, findMapEntity(ant.destination)); // this sets the movement too
                }
                break;
            case TaskType.Idle:
                setAntToIdle(ant);
                break;
        }
        ant.movementInitialized = true;
    });
};

const handleIdling = (ant: Ant) => {
    if (hasArrived(ant)) {
        if (Math.random() < 0.2) {
            ant.randomlyRotate();
        }
        if (Math.random() < 0.1) {
            findIdleCoords(ant);
        }
    }
}

const handleForage = (ant: Ant) => {
    if (!hasValidObjective(ant)) {
        console.log("Ant has no objective, setting one.");
        const searchingForChitin = ! ant.carriedEntity || ant.carriedEntity.type === EntityType.ChitinSource;
        if (!setAntObjective(ant, findClosestSource(ant.coords, searchingForChitin))) {
            // if no food source is found, set the ant to hover around the gateway without setting it to idle
            const gateWayCoords = findGateway()?.coords ?? { x: GameMap.center.x, y: GameMap.center.y };
            ant.movingTo.x = gateWayCoords.x + Math.random() * 20 - 10;
            ant.movingTo.y = gateWayCoords.y + Math.random() * 20 - 10;
            ant.setAngle();
        };
        // if at carrying capacity, return to deposit the food
        if (checkIfAtCapacity(ant)) {
            setDestination(ant, findGateway());
        }
    }
    // if at the food source or the gateway
    if (hasArrived(ant)) {
        const destinationEntity = findMapEntity(ant.destination);
        if (!destinationEntity) {
            console.warn("Destination entity not found");
            const closestSource = findClosestSource(ant.coords, true);
            if (closestSource) {
                setAntObjective(ant, closestSource);
            } else {
                setDestination(ant, findGateway());
            }
            return;
        }
        switch (destinationEntity.type) {
            case EntityType.FoodResource:
                handleAtFoodSource(ant, destinationEntity);
                break;
            case EntityType.Gateway:
                handleAtGateway(ant);
                break;
            case EntityType.ChitinSource:
                handleAtChitinSource(ant, destinationEntity);
                break;
            default:
                console.log("Ant reached an unknown entity type");
        }
    }
}


const handleAttack = (ant: Ant) => {
    const enemy = findEnemyByCondition((enemy) => enemy.id === ant.objective);
    if (!enemy) {
        if (ant.type === AntType.Soldier) { startPatrol(ant); } else { setAntToIdle(ant); }
    } else {
        ant.movingTo.x = enemy.coords.x;
        ant.movingTo.y = enemy.coords.y;
        if (hasArrived(ant)) {
            ant.isAttacking = true;
        }
    }
}

const handlePatrol = (ant: Ant) => {
    ant.isAttacking = false;
    const isInRange = (enemy: Enemy) => {
        return calculateDistance(ant.coords, enemy.coords) < vars.ant.patrolRange;
    }
    const enemy = findEnemyByCondition(isInRange);
    if (enemy) {
        ant.setEnemy(enemy);
    } else {
        // todo add patrol logic
        if (hasArrived(ant)) {
            findNewPatrolCoords(ant);
        }
    }
}



const handleAtGateway = (ant: Ant) => {
    const { food,chitin, updateColony } = useColonyStore.getState();
    if (ant.carriedEntity && ant.carriedEntity.type === EntityType.FoodResource) {
        updateColony({ food: food + ant.carriedEntity.amount});
        ant.carriedEntity = null;
    } else if (ant.carriedEntity && ant.carriedEntity.type === EntityType.ChitinSource) {
        updateColony({ chitin: chitin + ant.carriedEntity.amount });
        ant.carriedEntity = null;
    }
    if (hasValidObjective(ant)) {
        setDestination(ant, findMapEntity(ant.objective));
    } else {
        setAntObjective(ant, findClosestSource(ant.coords, true));
    }
};



const handleAtChitinSource = (ant: Ant, chitinSource: MapEntity) => {
    const isChitinSourceEmpty = chitinSource.amount <= 0;
    const carryingOtherEntity = ant.carriedEntity && ant.carriedEntity.type !== EntityType.ChitinSource;

    if (checkIfAtCapacity(ant) || isChitinSourceEmpty) {
        ant.isBusy = false;
        setDestination(ant, findGateway());
        return;
    }

    if (carryingOtherEntity) {
        ant.carriedEntity = null;
    }

    if (!ant.carriedEntity) {
        ant.carriedEntity = new MapEntity(
            v4(),
            EntityType.ChitinSource,
            undefined,
            vars.ui.carriedEntitySize, // Updated to use env
            vars.food.chitinCollectRate,
            "chitin",
        );
        chitinSource.decreaseAmount(vars.food.chitinCollectRate);
        ant.isBusy = true; // Set the ant to busy state
    } else {
        ant.carriedEntity.amount += vars.food.chitinCollectRate;
        chitinSource.decreaseAmount(vars.food.chitinCollectRate);
        ant.isBusy = true; // Set the ant to busy state
        moveWhileBusy(ant);
    }

}

const handleAtFoodSource = (ant: Ant, foodSource: MapEntity) => {

    if (ant.carriedEntity) {
        // this shouldn't happen but it bugs out sometimes
        if (ant.carriedEntity.type === EntityType.ChitinSource) {
            setDestination(ant, findGateway());
            return;
        }
        
        if (checkIfAtCapacity(ant)) { // if the ant is at capacity
            ant.isBusy = false; // Reset the busy state
            setDestination(ant, findGateway());
            return;
        } else if (foodSource.amount <= 0) { // if the food source is empty
            ant.isBusy = false; // Reset the busy state
            setAntObjective(ant, findClosestSource(ant.coords, false));
        } else {
            ant.isBusy = true; // Set the ant to busy state
            ant.carriedEntity.amount += 1;
            // handle the case where ant is eating from another source
            if (ant.carriedEntity instanceof Fruit && foodSource instanceof Fruit) {
                if (foodSource.col !== ant.carriedEntity.col || foodSource.row !== ant.carriedEntity.row) {
                    ant.carriedEntity.col = foodSource.col;
                    ant.carriedEntity.row = foodSource.row;
                }
            }
            foodSource.decreaseAmount(1)
            moveWhileBusy(ant);
        }
    } else {
        if (foodSource instanceof Fruit) {    
            ant.carriedEntity = new Fruit(undefined, 1, foodSource.col, foodSource.row, 0, vars.ui.carriedEntitySize); // Updated to use env
        } else {
            ant.carriedEntity = new MapEntity(
                v4(),
                EntityType.FoodResource,
                undefined,
                vars.ui.carriedEntitySize, // Updated to use env
                1,
                foodSource.imgName
            );
        }
        ant.isBusy = true; // Set the ant to busy state
        foodSource.amount -= 1;

    }
};
