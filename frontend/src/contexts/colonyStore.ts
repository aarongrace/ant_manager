import { create } from "zustand";
import { useUserStore } from "./userStore";

// Can't destructure without this
type ColonyStore = {
  id: string;
  name: string;
  ants: number;
  eggs: number; // Added eggs property
  food: number;
  sand: number;
  age: number;
  map: string;
  perkPurchased: string[];
  fetchColonyInfo: () => Promise<void>;
};

export const useColonyStore = create<ColonyStore>((set, get) => ({
  id: "",
  name: "",
  ants: 0,
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

  // not in used, should be handled in the backend
  // // // Add an ant (increases ants by 1 and decreases food by 20)
  // // addAnt: () => {
  // //   const { ants, food, eggs } = get();
  //   if (food < 20) {
  //     throw new Error("Not enough food to add an ant");
  //   }
  //   if (eggs <= 0) {
  //     throw new Error("No eggs available to hatch an ant");
  //   }
  //   set({
  //     ants: ants + 1,
  //     food: food - 20,
  //     eggs: Math.max(0, get().eggs - 1),
  //   });
 
 }));