import { create } from "zustand";
import { useUserStore } from "./userStore";

import { Ant, TaskEnum } from "../baseClasses/Ant";
import { MapEntity } from "../baseClasses/MapEntity"; // Import MapEntity

// Can't destructure without this
type ColonyStore = {
  id: string;
  name: string;
  ants: Ant[];
  mapEntities: MapEntity[]; // Add mapEntities field
  eggs: number;
  food: number;
  sand: number;
  age: number;
  map: string;
  perkPurchased: string[];
  updateMapEntities: (updates: { [id: string]: Partial<MapEntity> }) => void; // Update updateMapEntities function
  fetchColonyInfo: () => Promise<void>;
  putColonyInfo: () => Promise<void>;  
  updateColony: (updates: Partial<ColonyStore>) => void;
};

export const useColonyStore = create<ColonyStore>((set, get) => ({
  id: "",
  name: "",
  ants: [],
  mapEntities: [], // Initialize mapEntities as an empty array
  eggs: 5, // Default eggs set to 5
  food: 0,
  sand: 0,
  age: 0,
  map: "",
  perkPurchased: [],

  // Fetch a colony from the backend
  fetchColonyInfo: async () => {
    const userID = useUserStore.getState().userID;
    if (!userID) {
      throw new Error("User ID is not set");
    }

    const response = await fetch(`http://localhost:8000/colonies/${userID}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Colony data:", data);
    set({
      ...data
    });
  },

  // not in use. There is no need for a set function for an array
  updateMapEntities: (updates: { [id: string]: Partial<MapEntity> }) => {
    console.log("Updating map entities with partial updates:", updates);

    const currentMapEntities = get().mapEntities;

    // Map updates to the current mapEntities
    const updatedMapEntities = currentMapEntities.map((entity) => {
      const update = updates[entity.id];
      if (update) {
        return {
          ...entity,
          ...update, // Merge the existing entity with the partial update
        };
      }
      return entity; // Return the entity unchanged if no update exists
    });

    set({ mapEntities: updatedMapEntities });
  },

  putColonyInfo: async () => {
    const colonyState = get();
    console.log("Putting colony info...", colonyState);
    const userID = useUserStore.getState().userID;
    const colonyInfo = {
      id: userID,
      name: colonyState.name,
      ants: colonyState.ants,
      mapEntities: colonyState.mapEntities,
      eggs: colonyState.eggs,
      food: colonyState.food,
      sand: colonyState.sand,
      age: colonyState.age,
      map: colonyState.map,
      perkPurchased: colonyState.perkPurchased,
    }


    try {
      const response = await fetch(`http://localhost:8000/colonies/${userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(colonyInfo),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Colony updated successfully:", data);
    } catch (error) {
      console.error("Error updating colony:", error);
    }

  },

  updateColony: (updates: Partial<ColonyStore>) => {
    console.log("Updating colony with partial updates:", updates);
    set((state) => ({
      ...state,
      ...updates,
    }));
  },
}));