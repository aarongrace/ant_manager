import { create } from "zustand";
import { useUserStore } from "./userStore";



// UNUSED 
// this is a bad idea


// This type gives the create<> a structure to follow
// This is helpful for auto-completion and type checking
type GenericStore<T> = {
  item: T | null;
  fetchItem: () => Promise<void>;
  setItem: (newItem: T) => Promise<void>;
};

// Update this to use FastAPI backend and reference userID from userStore
export const useGenericStore = <T extends { id: string }>(
  constructor: new (...args: any[]) => T, endpoint: string
) => {
  return create<GenericStore<T>>((set) => ({
    item: null,

    // Fetch an item from the backend
    fetchItem: async () => {
      const userID = useUserStore.getState().userID; // Access userID dynamically
      if (!userID) {
        throw new Error("User ID is not set");
      }

      const response = await fetch(`http://localhost:8000/${endpoint}/${userID}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const newItem = new constructor(...data);
      set({ item: newItem });
    },

    // Set an item (POST to the backend)
    setItem: async (newItem: T) => {
      const userID = useUserStore.getState().userID; // Access userID dynamically
      if (!userID) {
        throw new Error("User ID is not set");
      }

      const response = await fetch(`http://localhost:8000/${endpoint}/${userID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      set({ item: newItem });
    },
  }));
};

