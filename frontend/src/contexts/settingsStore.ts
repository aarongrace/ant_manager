import { create } from "zustand";

type SettingsStore = {
    canvasWidth: number;
    canvasHeight: number;

    syncInterval: number;
    foodPerAnt: number;
};

export const useSettingsStore = create<SettingsStore> ((set) => ({
    canvasWidth: 550,
    canvasHeight: 400,

    syncInterval: 3000,
    foodPerAnt: 20,
}));

export const WorkerCarryingCapacity = 5;
export const SoldierCarryingCapacity = 7;
export const discreteUpdateInterval = 500;
export const workerSpeed = 0.0001;
export const soldierSpeed = 0.00007;

export const carriedEntitySize = {
    width: 15,
    height: 15,
}