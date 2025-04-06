import { create } from "zustand";
import { useUserStore } from "./userStore";

import { Ant, TaskEnum } from "../baseClasses/Ant"; 

// Can't destructure without this
type ColonyStore = {
  id: string;
  name: string;
  ants: Ant[];
  eggs: number; // Added eggs property
  food: number;
  sand: number;
  age: number;
  map: string;
  perkPurchased: string[];
  updateAnts: (deltaTime: number) => void;
  fetchColonyInfo: () => Promise<void>;
};

export const useColonyStore = create<ColonyStore>((set, get) => ({
  id: "",
  name: "",
  ants: [],
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
      id: data.id,
      name: data.name,
      ants: data.ants,
      eggs: data.eggs,
      food: data.food,
      sand: data.sand,
      age: data.age,
      map: data.map,
      perkPurchased: data.perkPurchased,
    });
  },

  updateAnts: ( deltaTime: number) => {
      console.log("Updating ants with deltaTime:", deltaTime);
      const ants = get().ants.map((ant: Ant) => ({
        ...ant,
        position:{
          ...ant.position,
          x:  (ant.position.x + 0.00008 * deltaTime) % 1 ,
        }
      }));
      set({ ants: ants });
  }
 
 }));