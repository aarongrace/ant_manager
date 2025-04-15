import { create } from "zustand";
import { useUserStore } from "./userStore";

import { Ant, AntRef, makeNewAnt, convertAnts, convertAntRefs } from "../baseClasses/Ant";
import { MapEntity } from "../baseClasses/MapEntity"; // Import MapEntity

// Define the ColonyStore type
type ColonyStore = {
  id: string;
  name: string;
  ants: Ant[];
  mapEntities: MapEntity[];
  eggs: number;
  food: number;
  sand: number;
  age: number;
  map: string;
  perkPurchased: string[];
  updateMapEntities: (updates: { [id: string]: Partial<MapEntity> }) => void;
  fetchColonyInfo: () => Promise<void>;
  putColonyInfo: () => Promise<void>;
  updateColony: (updates: Partial<ColonyStore>) => void;
};

export const useColonyStore = create<ColonyStore>((set, get) => ({
  id: "",
  name: "",
  ants: [],
  mapEntities: [],
  eggs: 5,
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

    // Convert AntRef objects to Ant objects
    const ants = convertAntRefs(data.ants as AntRef[]);

    set({
      ...data,
      ants, // Replace ants with the converted Ant objects
    });
  },

  // Update map entities
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

  // Send colony info to the backend
  putColonyInfo: async () => {
    const colonyState = get();
    console.log("Putting colony info...", colonyState);

    const userID = useUserStore.getState().userID;
    if (!userID) {
      throw new Error("User ID is not set");
    }

    // Convert Ant objects to AntRef objects
    const ants = convertAnts(colonyState.ants);

    const colonyInfo = {
      id: userID,
      name: colonyState.name,
      ants, // Use the converted AntRef objects
      mapEntities: colonyState.mapEntities,
      eggs: colonyState.eggs,
      food: colonyState.food,
      sand: colonyState.sand,
      age: colonyState.age,
      map: colonyState.map,
      perkPurchased: colonyState.perkPurchased,
    };

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

  // Update colony state
  updateColony: (updates: Partial<ColonyStore>) => {
    console.log("Updating colony with partial updates:", updates);
    set((state) => ({
      ...state,
      ...updates,
    }));
  },
}));