import { create } from "zustand";

const usePlayerStatsStore = create((set) => ({
    ants: 280,
    food: 50,
    sand: 100,
    land: 2,
    maxAnts: 300, // level 1: 300, level 2: 600, level 3: 1200, etc.
    updateStats: (key, value) => set((state) => ({ ...state, [key]: value })),
}));

export default usePlayerStatsStore;