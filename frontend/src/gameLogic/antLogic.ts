import { v4 } from "uuid";
import { Ant, TaskEnum } from "../baseClasses/Ant";
import { Fruit } from "../baseClasses/Fruit";
import { EntityTypeEnum, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { carriedEntitySize } from "../contexts/settingsStore";
import { findIdleCoords, hasArrived, moveWhileBusy, setAntObjective, setAntToIdle, setDestination } from "./antHelperFunctions";
import { findClosestFoodSource, findGateway, findMapEntity, checkIfObjectiveExists as hasValidObjective } from "./entityHelperFunctions";

export const handleAntLogic = (ant: Ant) => {
    updateObjective(ant);
    handleDestinationCheck(ant);
};

// this is crucial because movingTo, anchorPoints and etc. are not stored in the backend
export const initializeAntLogic = () => {
    const { ants } = useColonyStore.getState();
    ants.forEach((ant) => {

        switch (ant.task) {
            case TaskEnum.Foraging:
                if (!hasValidObjective(ant)) {
                    setAntObjective(ant, findClosestFoodSource(ant));
                } else {
                    setDestination(ant, findMapEntity(ant.destination)); // this sets the movement too
                }
                break;
            case TaskEnum.Idle:
                setAntToIdle(ant);
                break;
        }
        ant.movementInitialized = true;
    });
};

const updateObjective = (ant: Ant) => {
    if (ant.task === TaskEnum.Foraging) {
        if (!hasValidObjective(ant)) {
            console.log("Ant has no objective, setting one.");
            setAntObjective(ant, findClosestFoodSource(ant));
            if (ant.carrying && ant.carrying.amount === ant.carryingCapacity) {
                setDestination(ant, findGateway());
            }
        }
    } else if (ant.task === TaskEnum.Idle) {
        if (hasArrived(ant)) {
            if (Math.random() < 0.2) {
                ant.randomlyRotate();
            }
            if (Math.random() < 0.1) {
                findIdleCoords(ant);
            }
        }
    }
};

const handleDestinationCheck = (ant: Ant) => {
    if (ant.task === TaskEnum.Idle) {
        return;
    }
    if (hasArrived(ant)) {
        switch (ant.task) {
            case TaskEnum.Foraging:
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
                break;
        }
    }
};

const handleAtGateway = (ant: Ant) => {
    const { food, updateColony } = useColonyStore.getState();
    if (ant.carrying){
        updateColony({ food: food + ant.carrying.amount});
        ant.carrying = null;
    }

    if (hasValidObjective(ant)) {
        setDestination(ant, findMapEntity(ant.objective));
    } else {
        updateObjective(ant);
    }
};

const handleAtFoodSource = (ant: Ant, foodSource: MapEntity) => {
    // const isAtCapacity = ant.carrying ?  ant.carrying.amount >= ant.carryingCapacity : false;

    if (ant.carrying) {
        console.log("Ant is carrying something", ant.carrying);
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
