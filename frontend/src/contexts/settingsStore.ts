import { create } from "zustand";

type SettingsStore = {
    canvasWidth: number;
    canvasHeight: number;
    syncInterval: number;
};

export const useSettingsStore = create<SettingsStore> ((set) => ({
    canvasWidth: 550,
    canvasHeight: 400,
    syncInterval: 350,
}));