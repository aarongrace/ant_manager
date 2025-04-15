import { Ant, AntTypeEnum, TaskEnum } from "../baseClasses/Ant";
import { MapEntity, EntityTypeEnum } from "../baseClasses/MapEntity";
import { findMapEntity, detectAntCollision, findClosestFoodSource, findGateway, checkIfObjectiveExists as hasValidObjective } from "./entityHelperFunctions";
import { useColonyStore } from "../contexts/colonyStore";
import { findIdlePosition, hasArrived, setAntObjective, setAntToIdle, setDestination } from "./antHelperFunctions";

export const handleAntLogic = (ant: Ant) => {
    updateObjective(ant);
    handleDestinationCheck(ant);
};

const updateObjective = (ant: Ant) => {
    if (ant.task === TaskEnum.Foraging){
        if (!hasValidObjective(ant)) {
            console.log("Ant has no objective, setting one.");
            setAntObjective(ant, findClosestFoodSource(ant));
            if (ant.amountCarried === ant.carryingCapacity) {
                setDestination(ant, findGateway());
            }
        }
    } else if (ant.task === TaskEnum.Idle) {
        if (hasArrived(ant)) {
            if (Math.random() < 0.2) {
                ant.randomlyRotate();
            } 
            if (Math.random() < 0.1) {
               findIdlePosition(ant);
            }
        } 
    }
};

const handleDestinationCheck = (ant: Ant) => {
    if (hasArrived(ant)){
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
    updateColony({ food: food + ant.amountCarried });
    ant.amountCarried = 0; // Reset the amount carried
    ant.carrying = ""; // Reset the carrying item

    if (hasValidObjective(ant)) {
        console.log("Ant has a valid objective, setting new destination.");
        setDestination(ant, findMapEntity(ant.objective));
    } else {
        console.log("Ant has no valid objective, setting new one.");
        updateObjective(ant);
    }
};

const handleAtFoodSource = (ant: Ant, foodSource: MapEntity) => {
    const isAtCapacity = ant.amountCarried >= ant.carryingCapacity;

    if (foodSource.remainingAmount <= 0 && !isAtCapacity) {
        console.warn("Food source is empty, setting new objective.");
        ant.isBusy = false; // Reset the busy state
        setAntObjective(ant, findClosestFoodSource(ant));
    } else if (!isAtCapacity) {
        ant.isBusy = true; // Set the ant to busy state
        ant.carrying = foodSource.imgName;
        ant.amountCarried += 1;
        foodSource.remainingAmount -= 1;
    } else {
        ant.isBusy = false; // Reset the busy state
        setDestination(ant, findGateway());
    }
};
