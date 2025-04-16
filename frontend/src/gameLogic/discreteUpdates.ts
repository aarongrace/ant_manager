import { AntTypeEnum } from "../baseClasses/Ant";
import { Fruit } from "../baseClasses/Fruit";
import { MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { eggChance, useSettingsStore } from "../contexts/settingsStore";
import { handleAntLogic } from "./antLogic"; // Import the new combined function
import { decayFoodSource } from "./entityHelperFunctions";

export const updateDiscreteGameState = () => {
    const { ants } = useColonyStore.getState();
    ants.forEach((ant) => {
        handleAntLogic(ant); // Use the new combined function
    });
    addRandomMapEntity();
    deleteEmptyMapEntities();
    consumeFood();
    decayFoodSource();
    layEgg();
};

const layEgg = () => {
    if (Math.random()  < eggChance){
        const { eggs, updateColony } = useColonyStore.getState();
        updateColony({ eggs: eggs + 1})
    }
}

const consumeFood = () => {
    const { ants, food, updateColony } = useColonyStore.getState();
    const { workerFoodConsumption, soldierFoodConsumption, queenFoodConsumption, foodConsumptionScaleFactor, foodWasteBaseline } = useSettingsStore.getState();
    const wasteFactor = Math.max(0.6, 1 + (food - foodWasteBaseline) / foodWasteBaseline);
    const foodConsumed = (ants.reduce((total, ant) => {
        if (ant.type === AntTypeEnum.Worker) {
            return total + workerFoodConsumption;
        } else if (ant.type === AntTypeEnum.Soldier) {
            return total + soldierFoodConsumption;
        } else if (ant.type === AntTypeEnum.Queen) {
            return total + queenFoodConsumption;
        }
        return total;
    }, 0)) * foodConsumptionScaleFactor * wasteFactor;

    const foodLeft = food - foodConsumed;
    if (foodLeft < 0) {
        console.warn("Not enough food to consume");
        updateColony({ food: 0 });
        handleNoFood(foodLeft);

    } else {
        updateColony({ food: food - foodConsumed });
    }
};


const handleNoFood = (negativeFoodLeft: number) => {
    const {ants, updateColony } = useColonyStore.getState();
    if (Math.random() * 10 < negativeFoodLeft * negativeFoodLeft){
        const randomAnt = ants.find((ant) => ant.type === AntTypeEnum.Worker || ant.type === AntTypeEnum.Soldier);
        if (!randomAnt) {
            // No worker or soldier ants left kill the queen
            updateColony({ ants: [] });
        } else {
            const newAnts = ants.filter((ant) => ant.id !== randomAnt.id);
            updateColony({ ants: newAnts });
        }

    }
}


const deleteEmptyMapEntities = () => {
    const { mapEntities, updateColony } = useColonyStore.getState();
    const nonEmptyMapEntities = mapEntities.filter((entity) => entity.amount > 0);
    if (nonEmptyMapEntities.length !== mapEntities.length) {
        console.log("Deleting empty map entities");
        updateColony({ mapEntities: nonEmptyMapEntities });
    }
};

const addRandomMapEntity = () => {
    const { entitySpawnFactor } = useSettingsStore.getState();
    const { mapEntities, updateColony } = useColonyStore.getState();

    const numberOfMapEntities = mapEntities.length;
    const probability = 1 / Math.pow(numberOfMapEntities + 1, entitySpawnFactor);
    if (Math.random() > probability) {
        return;
    }
    console.log("Adding random map entity");

    const randomEntity = Math.random()>0.95 ? MapEntity.createRandomMapEntity() : Fruit.createRandomFruit();

    if (randomEntity) {
        updateColony({
            mapEntities: [...mapEntities, randomEntity],
        });
    }
};