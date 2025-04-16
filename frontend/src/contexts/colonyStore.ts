import { create } from "zustand";
import { getUserID } from "./userStore";

import { Ant, AntRef, convertAntRefs, convertAnts, makeNewAnt, recreateQueen } from "../baseClasses/Ant";
import { Fruit, FruitRef } from "../baseClasses/Fruit";
import { MapEntity, MapEntityRef } from "../baseClasses/MapEntity"; // Import MapEntity

// Define the ColonyStore type
type ColonyStore = {
  name: string;
  ants: Ant[];
  mapEntities: MapEntity[];
  eggs: number;
  food: number;
  sand: number;
  age: number;
  map: string;
  perkPurchased: string[];
  fetchColonyInfo: () => Promise<void>;
  putColonyInfo: () => Promise<void>;
  updateColony: (updates: Partial<ColonyStore>) => void;
};

export const useColonyStore = create<ColonyStore>((set, get) => ({
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
    const userID = getUserID();
    if (!userID) {
      throw new Error("User ID is not set for fetchColonyInfo");
    }

    const response = await fetch(`http://localhost:8000/colonies/${userID}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Colony data:", data);

    if (data.initialized === false) {
      console.warn("Colony not initialized, creating a new one...");
      const newColony = createFreshColony();
      set({
        ...newColony,
      });
      await get().putColonyInfo();
    } else {
      // Convert AntRef objects to Ant objects
      const ants = convertAntRefs(data.ants as AntRef[]);
      const mapEntities = data.mapEntities.map((entity: any) => {
        return MapEntity.fromMapEntityRef(entity);
      });
      console.log("mapEntities", mapEntities);
      const fruits = data.fruits.map((fruit: any) => {
        return Fruit.fromFruitRef(fruit);
      });
      mapEntities.push(...fruits);

      set({
        ...data,
        ants, // Replace ants with the converted Ant objects
        mapEntities, // Replace mapEntities with the converted MapEntity objects
      });
    }
  },

  // Send colony info to the backend
  putColonyInfo: async () => {
    const colonyState = get();
    console.log("Putting colony info...", colonyState);

    const userID = getUserID();
    if (!userID) {
      console.error("User ID is not set for putColonyInfo");
      await get().fetchColonyInfo();
      return;
    }

    // Convert Ant objects to AntRef objects
    const ants = convertAnts(colonyState.ants);
    const refs = convertEntityObjectsToRefs(colonyState.mapEntities);

    const colonyInfo = {
      name: colonyState.name,
      ants, // Use the converted AntRef objects
      mapEntities: refs.mapEntityRefs,
      fruits: refs.fruitRefs,
      eggs: colonyState.eggs,
      food: colonyState.food,
      sand: colonyState.sand,
      age: colonyState.age,
      map: colonyState.map,
      perkPurchased: colonyState.perkPurchased,
      initialized: true,
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
    // console.log("Updating colony with partial updates:", updates);
    set((state) => ({
      ...state,
      ...updates,
    }));
  },
}));



export const createFreshColony = () => {
  const nestEntrance = MapEntity.recreateNestEntrance();
  console.log("Nest entrance:", nestEntrance);
  const mapEntities = [nestEntrance, MapEntity.createRandomMapEntity(),Fruit.createRandomFruit()];
  const queen = recreateQueen();
  queen.coords = {
    x: nestEntrance.coords.x + nestEntrance.size.width / 2.5,
    y: nestEntrance.coords.y + nestEntrance.size.height / 3,
  };

  const ants = [queen, makeNewAnt(), makeNewAnt(), makeNewAnt()];

  return {
    ants: ants,
    name: "New Colony",
    map: "nest",
    eggs: 5,
    food: 200,
    sand: 200,
    age: 0,
    mapEntities: mapEntities,
    perkPurchased: [],
    initialized: true,
  }
};

const convertEntityObjectsToRefs = (mapEntities: MapEntity[]): { mapEntityRefs: MapEntityRef[]; fruitRefs: FruitRef[] } => {
  var mapEntityRefs: MapEntityRef[] = [];
  var fruitRefs: FruitRef[] = [];

  mapEntities.forEach((entity) => {
    if (entity instanceof Fruit) {
      fruitRefs.push(entity.toFruitRef());
    } else {
      mapEntityRefs.push(entity.toMapEntityRef());
    }
  });
  return {
    mapEntityRefs: mapEntityRefs,
    fruitRefs: fruitRefs,
  };
};
