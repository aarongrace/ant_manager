import { v4 } from "uuid";
import { Ant, AntType, TaskType } from "../baseClasses/Ant";
import { Enemy } from "../baseClasses/Enemy";
import { Fruit } from "../baseClasses/Fruit";
import { EntityType, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { vals } from "../contexts/globalVars"; // Updated to use env
import { findIdleCoords, findNewPatrolCoords, hasArrived, moveWhileBusy, setAntObjective, setAntToIdle, setDestination, startPatrol } from "./antHelperFunctions";
import { findEnemyByCondition } from "./enemyHelperFunctions";
import { calculateDistance, findClosestFoodSource, findGateway, findMapEntity, checkIfObjectiveExists as hasValidObjective } from "./entityHelperFunctions";

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
                    setAntObjective(ant, findClosestFoodSource(ant.coords));
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
        setAntObjective(ant, findClosestFoodSource(ant.coords));
        if (ant.carrying && ant.carrying.amount === ant.carryingCapacity) {
            setDestination(ant, findGateway());
        }
    }
    if (hasArrived(ant)) {
        const destinationEntity = findMapEntity(ant.destination);
        if (!destinationEntity) {
            console.warn("Destination entity not found");
            setAntToIdle(ant);
            return;
        }
        switch (destinationEntity.type) {
            case EntityType.FoodResource:
                handleAtFoodSource(ant, destinationEntity);
                break;
            case EntityType.Gateway:
                handleAtGateway(ant);
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
        return calculateDistance(ant.coords, enemy.coords) < vals.ant.patrolRange;
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
    const { food, updateColony } = useColonyStore.getState();
    if (ant.carrying){
        updateColony({ food: food + ant.carrying.amount});
        ant.carrying = null;
    }
    if (hasValidObjective(ant)) {
        setDestination(ant, findMapEntity(ant.objective));
    } else {
        setAntObjective(ant, findClosestFoodSource(ant.coords));
    }
};

const handleAtFoodSource = (ant: Ant, foodSource: MapEntity) => {
    // const isAtCapacity = ant.carrying ?  ant.carrying.amount >= ant.carryingCapacity : false;

    if (ant.carrying) {
        if (ant.carrying.amount >= ant.carryingCapacity) {
            ant.isBusy = false; // Reset the busy state
            setDestination(ant, findGateway());
            return;
        } else if (foodSource.amount <= 0) { // if the food source is empty
            ant.isBusy = false; // Reset the busy state
            setAntObjective(ant, findClosestFoodSource(ant.coords));
        } else {
            ant.isBusy = true; // Set the ant to busy state
            ant.carrying.amount += 1;
            // handle the case where ant is eating from another source
            if (ant.carrying instanceof Fruit && foodSource instanceof Fruit) {
                if (foodSource.col !== ant.carrying.col || foodSource.row !== ant.carrying.row) {
                    ant.carrying.col = foodSource.col;
                    ant.carrying.row = foodSource.row;
                }
            }
            foodSource.decreaseAmount(1)
            moveWhileBusy(ant);
        }
    } else {
        if (foodSource instanceof Fruit) {    
            ant.carrying = new Fruit(undefined, 1, foodSource.col, foodSource.row, 0, vals.ui.carriedEntitySize); // Updated to use env
        } else {
            ant.carrying = new MapEntity(
                v4(),
                EntityType.FoodResource,
                undefined,
                vals.ui.carriedEntitySize, // Updated to use env
                1,
                foodSource.imgName
            );
        }
        ant.isBusy = true; // Set the ant to busy state
        foodSource.amount -= 1;

    }
};
