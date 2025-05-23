
import { useWarningStore } from "../components/WarningBar";
import { useColonyStore } from "../contexts/colonyStore";
import { vars } from "../contexts/globalVariables"; // Updated to use env
import { findAntByCondition } from "./antHelperFunctions";
import { handleAntLogic } from "./antLogic"; // Import the new combined function
import { AntType } from "./baseClasses/Ant";
import { createEnemy } from "./baseClasses/Enemy";
import { Fruit } from "./baseClasses/Fruit";
import { useIconsStore } from "./baseClasses/Icon";
import { GameMap } from "./baseClasses/Map";
import { MapEntity } from "./baseClasses/MapEntity";
import { decaySources } from "./entityHelperFunctions";

export const updateDiscreteGameState = (setCursor:()=>void) => {
    const { ants, enemies } = useColonyStore.getState();
    const { setTaskNumbers } = useIconsStore.getState();

    ants.forEach((ant) => {
        handleAntLogic(ant); // Use the new combined function
    });

    enemies.forEach((enemy) => {
        enemy.discreteUpdate();
    });

    setTaskNumbers();
    deleteEmptyMapEntities();
    spawnRandomEnemy();
    consumeFoodAndRestoreHp();
    decaySources();
    layEgg();
    incrementAge(setCursor);
    checkIfAllDead();
};


const checkIfAllDead = () => {
    const { ants, updateColony } = useColonyStore.getState();
    const { startWarning } = useWarningStore.getState();
    const allDead = ants.every((ant) => ant.hp <= 0);
    if (allDead) {
        console.log("All ants are dead. Game over.");
        updateColony({ ants: [], enemies: [] });
        startWarning("All ants are dead. Game over.", 1000);
    }
}

const incrementAge = (setCursor:()=>void) =>{
    const { age, updateColony } = useColonyStore.getState();
    const newAge = age + 1;
    updateColony({ age: newAge });
    GameMap.incrementUpdateCounter();
    if (newAge % vars.seasonLength === 0) {
        vars.season = (vars.season + 1) % 4;
        setCursor();
    }
}

const layEgg = () => {
    const { eggs, updateColony } = useColonyStore.getState();
    if (eggs < vars.reproduction.maxEggs && findAntByCondition((ant) => ant.type === AntType.Queen) && Math.random() < vars.reproduction.eggChance) { // Updated to use env
        updateColony({ eggs: eggs + 1 });
    }
};

const consumeFoodAndRestoreHp = () => {
    const { ants, food, updateColony } = useColonyStore.getState();
    const { workerFoodConsumption, soldierFoodConsumption, queenFoodConsumption, foodConsumptionScaleFactor } = vars.ant;
    const { foodWasteBaseline } = vars.food;

    const wasteFactor = Math.max(0.6, 1 + (food - foodWasteBaseline) / foodWasteBaseline);
    const foodConsumed = (ants.reduce((total, ant) => {
        if (ant.type === AntType.Worker) {
            ant.hp += vars.ant.workerHpRecoveryRate;
            return total + workerFoodConsumption;
        } else if (ant.type === AntType.Soldier) {
            ant.hp += vars.ant.soldierHpRecoveryRate;
            return total + soldierFoodConsumption;
        } else if (ant.type === AntType.Queen) {
            ant.hp += vars.ant.queenHpRecoveryRate;
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
    const {startWarning} = useWarningStore.getState();
    ants.forEach((ant) => {
        ant.hp -= Math.abs(negativeFoodLeft) * 50 * Math.random(); 
    });
    startWarning("Not enough food! Ants are starving!", 1000);
    
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
    const spawnChance = vars.enemy.baseEnemySpawnChance / (Math.log(enemies.length + 2) ** 2); // Updated to use env
    if (Math.random() < spawnChance) {
        updateColony({
            enemies: [...enemies, createEnemy()],
        });
    }
};

//unused, food sources are now spawned based on tile
const addRandomMapEntity = () => {
    const { entitySpawnFactor } = vars.food; // Updated to use env
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