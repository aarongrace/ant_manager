
import { AntType } from "../baseClasses/Ant";
import { createEnemy } from "../baseClasses/Enemy";
import { Fruit } from "../baseClasses/Fruit";
import { useIconsStore } from "../baseClasses/Icon";
import { GameMap } from "../baseClasses/Map";
import { MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { vals } from "../contexts/globalVars"; // Updated to use env
import { findAntByCondition } from "./antHelperFunctions";
import { handleAntLogic } from "./antLogic"; // Import the new combined function
import { decayFoodSource } from "./entityHelperFunctions";

export const updateDiscreteGameState = (setCursor:()=>void) => {
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

    // addRandomMapEntity();
    deleteEmptyMapEntities();
    spawnRandomEnemy();
    consumeFoodAndRestoreHp();
    decayFoodSource();
    layEgg();

    incrementAge(setCursor);
};


const incrementAge = (setCursor:()=>void) =>{
    const { age, updateColony } = useColonyStore.getState();
    const newAge = age + 1;
    updateColony({ age: newAge });
    if (newAge % vals.seasonLength === 0) {
        vals.season = (vals.season + 1) % 4;
        setCursor();
    }
    GameMap.incrementUpdateCounter();
}

const layEgg = () => {
    const { eggs, updateColony } = useColonyStore.getState();
    if (eggs < vals.reproduction.maxEggs && findAntByCondition((ant) => ant.type === AntType.Queen) && Math.random() < vals.reproduction.eggChance) { // Updated to use env
        updateColony({ eggs: eggs + 1 });
    }
};

const consumeFoodAndRestoreHp = () => {
    const { ants, food, updateColony } = useColonyStore.getState();
    const { workerFoodConsumption, soldierFoodConsumption, queenFoodConsumption, foodConsumptionScaleFactor } = vals.ant;
    const { foodWasteBaseline } = vals.food;

    const wasteFactor = Math.max(0.6, 1 + (food - foodWasteBaseline) / foodWasteBaseline);
    const foodConsumed = (ants.reduce((total, ant) => {
        if (ant.type === AntType.Worker) {
            ant.hp += 0.2;
            return total + workerFoodConsumption;
        } else if (ant.type === AntType.Soldier) {
            ant.hp += 0.5;
            return total + soldierFoodConsumption;
        } else if (ant.type === AntType.Queen) {
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
    const { ants, updateColony } = useColonyStore.getState();
    if (Math.random() * 10 < negativeFoodLeft * negativeFoodLeft) {
        const randomAnt = ants.find((ant) => ant.type === AntType.Worker || ant.type === AntType.Soldier);
        if (!randomAnt) {
            updateColony({ ants: [] });
        } else {
            randomAnt.die();
        }
    }
};

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
    const spawnChance = vals.enemy.baseEnemySpawnChance / (Math.log(enemies.length + 2) ** 2); // Updated to use env
    if (Math.random() < spawnChance) {
        updateColony({
            enemies: [...enemies, createEnemy()],
        });
    }
};

//unused, food sources are now spawned based on tile
const addRandomMapEntity = () => {
    const { entitySpawnFactor } = vals.food; // Updated to use env
    const { mapEntities, updateColony } = useColonyStore.getState();

    const numberOfMapEntities = mapEntities.length;
    const probability = 1 / Math.pow(numberOfMapEntities + 1, entitySpawnFactor);
    if (Math.random() > probability) {
        return;
    }
    console.log("Adding random map entity");

    const randomEntity = Math.random() > 0.95 ? MapEntity.createRandomMapEntity() : Fruit.createRandomFruit();

    if (randomEntity) {
        updateColony({
            mapEntities: [...mapEntities, randomEntity],
        });
    }
};