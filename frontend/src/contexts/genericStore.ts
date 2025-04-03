import { create } from "zustand";
import User from "../baseClasses/User";

// this type gives the create<> a structure to follow
// this is helpful for auto-completion and type checking
type GenericStore<T> = {
  entities: T[];
  setEntities: (entities: T[]) => void;
  addEntity: (entity: T) => void;
  updateEntity: (id: string, updatedEntity: Partial<T>) => void;
  removeEntity: (id: string) => void;
};

export const useGenericStore = <T extends {id: string}> () =>{
  return create<GenericStore<T>>((set) => ({
    entities: [],
    setEntities: (es: T[]) => set ({ entities: es}),
    addEntity: (e : T) =>
      set((s) => ({
        entities: [...s.entities, e],
      })),
    updateEntity: (id: string, updatedE: Partial<T>) =>
      set((s) => ({
        entities: s.entities.map((e) =>
          e.id === id ? { ...e, ...updatedE } : e)
      })),
    removeEntity: (id: string) =>
      set((s) => ({
        entities: s.entities.filter((e) => e.id !== id)
      }))
}));};

