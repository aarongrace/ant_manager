import { AntTypes } from "../baseClasses/Ant";
import { createEnemy } from "../baseClasses/Enemy";
import { Fruit } from "../baseClasses/Fruit";
import { useIconsStore } from "../baseClasses/Icon";
import { MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { baseEnemySpawnChance, eggChance, useSettingsStore } from "../contexts/settingsStore";
import { findAntByCondition } from "./antHelperFunctions";
import { handleAntLogic } from "./antLogic"; // Import the new combined function
import { decayFoodSource } from "./entityHelperFunctions";

export const updateDiscreteGameState = () => {
    const { ants } = useColonyStore.getState();

    ants.forEach((ant) => {
        handleAntLogic(ant); // Use the new combined function
    });

    const { enemies } = useColonyStore.getState();
    enemies.forEach((enemy) => {
        enemy.discreteUpdate();
    });

    const { setTaskNumbers } = useIconsStore.getState();
    setTaskNumbers();

    addRandomMapEntity();
    deleteEmptyMapEntities();
    spawnRandomEnemy();
    consumeFoodAndRestoreHp();
    decayFoodSource();
    layEgg();
};

const layEgg = () => {
    if (findAntByCondition((ant)=>ant.type===AntTypes.Queen) && Math.random()  < eggChance){
        const { eggs, updateColony } = useColonyStore.getState();
        updateColony({ eggs: eggs + 1})
    }
}

const consumeFoodAndRestoreHp = () => {
    const { ants, food, updateColony } = useColonyStore.getState();
    const { workerFoodConsumption, soldierFoodConsumption, queenFoodConsumption, foodConsumptionScaleFactor, foodWasteBaseline } = useSettingsStore.getState();
    const wasteFactor = Math.max(0.6, 1 + (food - foodWasteBaseline) / foodWasteBaseline);
    const foodConsumed = (ants.reduce((total, ant) => {
        if (ant.type === AntTypes.Worker) {
            ant.hp += 0.2;
            return total + workerFoodConsumption;
        } else if (ant.type === AntTypes.Soldier) {
            ant.hp += 0.5;
            return total + soldierFoodConsumption;
        } else if (ant.type === AntTypes.Queen) {
            ant.hp += 0.6;
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
        const randomAnt = ants.find((ant) => ant.type === AntTypes.Worker || ant.type === AntTypes.Soldier);
        if (!randomAnt) {
            updateColony({ ants: [] });
        } else {
            randomAnt.die();
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


const spawnRandomEnemy = () => {
    const { enemies, updateColony } = useColonyStore.getState();
    const spawnChance = baseEnemySpawnChance / (Math.log(enemies.length + 2) ** 2);
    if (Math.random() < spawnChance) {
        updateColony({
            enemies: [...enemies, createEnemy()],
        });
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