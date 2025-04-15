import { create } from "zustand";

type SettingsStore = {
    canvasWidth: number;
    canvasHeight: number;

    syncInterval: number;
    foodPerAnt: number;

    entitySpawnFactor: number; // the smaller the more entities
    workerFoodConsumption: number; // per half second
    soldierFoodConsumption: number;
    queenFoodConsumption: number;
};

export const useSettingsStore = create<SettingsStore> ((set) => ({
    canvasWidth: 550,
    canvasHeight: 400,

    syncInterval: 3000,
    foodPerAnt: 20,
    entitySpawnFactor: 1.5,

    workerFoodConsumption: 0.5, // per half second
    soldierFoodConsumption: 0.8,
    queenFoodConsumption: 2
}));

export const workerCarryingCapacity = 5;
export const soldierCarryingCapacity = 7;
export const discreteUpdateInterval = 500;
export const workerSpeed = 0.0001;
export const soldierSpeed = 0.00007;
export const minDistanceBetweenEntities = 0.1;

export const carriedEntitySize = {
    width: 15,
    height: 15,
}