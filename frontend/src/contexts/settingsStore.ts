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
    foodConsumptionScaleFactor: number;
    foodWasteBaseline: number;

    hoveredEntityId: string | null; // doesn't really belong here, but for now it's ok
    setHoveredEntityId: (id: string | null) => void;

    setCanvasDimensions: (width: number, height: number) => void;
};

export const useSettingsStore = create<SettingsStore> ((set) => ({
    canvasWidth: 600,
    canvasHeight: 400,

    syncInterval: 3000,
    foodPerAnt: 20,
    entitySpawnFactor: 1.5,

    workerFoodConsumption: 1, // per half second
    soldierFoodConsumption: 1.5,
    queenFoodConsumption: 6,
    foodConsumptionScaleFactor: 0.13,
    foodWasteBaseline: 200,

    hoveredEntityId: null,
    setHoveredEntityId: (id: string | null) => set({ hoveredEntityId: id }),

    setCanvasDimensions : (width: number, height: number) => set(() => ({
        canvasWidth: width,
        canvasHeight: height,
    })),
}));

export const workerCarryingCapacity = 5;
export const soldierCarryingCapacity = 7;
export const discreteUpdateInterval = 500;
export const workerSpeed = 0.06;
export const soldierSpeed = 0.04;
export const queenSpeed = 0.03;
export const minDistanceBetweenEntities = 50;
export const eggChance = 0.03;
export const edgeMargin = 12;

export const foodDecayFactor = 0.3;
export const fruitSize = 40;
export const defaultFruitAmount = 50;

export const canvasProportions = {
    width: 0.6,
    height: 0.77,
};
export const idleSpeedFactor = 0.5;

export const carriedEntitySize = {
    width: 15,
    height: 15,
}
