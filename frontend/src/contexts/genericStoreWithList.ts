import { create } from "zustand";
import Profile from "../baseClasses/Profile";

// UNUSED
// this is a bad idea

// this type gives the create<> a structure to follow
// this is helpful for auto-completion and type checking
type GenericStoreWithList<T> = {
  items: T[];
  fetchItems: () => Promise<void>;
  setItems: (entities: T[]) => void;
  addItem: (entity: T) => void;
  updateItem: (id: string, updatedEntity: Partial<T>) => void;
  removeItem: (id: string) => void;
};


// update this to use fastAPI backend and then create specific functions to handle operations
export const useGenericStoreWithList = <T extends {id: string}> (constructor: new (...args:any[])=>T) =>{
  return create<GenericStoreWithList<T>>((set) => ({
    items: [],
    fetchItems: async () => {
      const endpoint = constructor.name;
      const response = await fetch('http://localhost:8000/${endpoint}');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const newItems = data.map((args:any[]) => new constructor(...args));
      set({ items: newItems });
    },
    setItems: (newIs: T[]) => set ({ items: newIs}),
    addItem: (newI : T) =>
      set((s) => ({
        items: [...s.items, newI],
      })),
    updateItem: (id: string, updatedI: Partial<T>) =>
      set((s) => ({
        items: s.items.map((item) =>
          item.id === id ? { ...item, ...updatedI } : item)
      })),
    removeItem: (id: string) =>
      set((s) => ({
        items: s.items.filter((item) => item.id !== id)
      }))
}));};

