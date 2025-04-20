import { v4 } from "uuid";
import { Ant, AntTypes, TaskTypes } from "../baseClasses/Ant";
import { Enemy } from "../baseClasses/Enemy";
import { Fruit } from "../baseClasses/Fruit";
import { EntityTypeEnum, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { carriedEntitySize } from "../contexts/settingsStore";
import { findIdleCoords, hasArrived, moveWhileBusy, setAntObjective, setAntToIdle, setDestination, startPatrol } from "./antHelperFunctions";
import { findEnemyByCondition } from "./enemyHelperFunctions";
import { calculateDistance, findClosestFoodSource, findGateway, findMapEntity, getRandomCoords, checkIfObjectiveExists as hasValidObjective } from "./entityHelperFunctions";

//todo add capability to draw multiple carried entities

export const handleAntLogic = (ant: Ant) => {
    if (ant.task === TaskTypes.Forage) { handleForage(ant);
    } else if (ant.task === TaskTypes.Idle) { handleIdling(ant);
    } else if (ant.task === TaskTypes.Attack) { handleAttack(ant);
    } else if (ant.task === TaskTypes.Patrol) { handlePatrol(ant); }
};

// this is crucial because movingTo, anchorPoints and etc. are not stored in the backend
export const initializeAntLogic = () => {
    const { ants } = useColonyStore.getState();
    ants.forEach((ant) => {

        switch (ant.task) {
            case TaskTypes.Forage:
                if (!hasValidObjective(ant)) {
                    setAntObjective(ant, findClosestFoodSource(ant));
                } else {
                    setDestination(ant, findMapEntity(ant.destination)); // this sets the movement too
                }
                break;
            case TaskTypes.Idle:
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
        setAntObjective(ant, findClosestFoodSource(ant));
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

const handleAttack = (ant: Ant) => {
    const enemy = findEnemyByCondition((enemy) => enemy.id === ant.objective);
    if (!enemy) {
        if (ant.type === AntTypes.Soldier) { startPatrol(ant); } else { setAntToIdle(ant); }
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
        return calculateDistance(ant.coords, enemy.coords) < Ant.patrolRange;
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

const findNewPatrolCoords = (ant: Ant) => {
    ant.movingTo = getRandomCoords();
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
        setAntObjective(ant, findClosestFoodSource(ant));
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
            setAntObjective(ant, findClosestFoodSource(ant));
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
            ant.carrying = new Fruit(undefined, 1, foodSource.col, foodSource.row, 0,carriedEntitySize);
        } else {
            ant.carrying = new MapEntity(
                v4(),
                EntityTypeEnum.FoodResource,
                undefined,
                carriedEntitySize,
                1,
                foodSource.imgName
            );
        }
        ant.isBusy = true; // Set the ant to busy state
        foodSource.amount -= 1;

    }
};
