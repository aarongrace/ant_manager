import { create } from "zustand";
import { getUserID } from "./userStore";

import { Ant, AntData, AntTypes, convertAntData, convertAnts, makeNewAnt, recreateQueen } from "../baseClasses/Ant";
import { createEnemy, Enemy, EnemyData } from "../baseClasses/Enemy";
import { Fruit, FruitData } from "../baseClasses/Fruit";
import { MapEntity, MapEntityData } from "../baseClasses/MapEntity"; // Import MapEntity

// Define the ColonyStore type
type ColonyStore = {
  name: string;
  ants: Ant[];
  enemies: Enemy[]; // Add enemies field
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
  enemies: [], // Initialize enemies
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
      const ants = convertAntData(data.ants as AntData[]);
      const enemies = data.enemies.map((enemy: EnemyData) => Enemy.fromData(enemy)); // Convert enemies
      const mapEntities = data.mapEntities.map((entity: any) => {
        return MapEntity.fromMapEntityData(entity);
      });
      console.log("mapEntities", mapEntities);
      const fruits = data.fruits.map((fruit: any) => {
        return Fruit.fromFruitData(fruit);
      });
      mapEntities.push(...fruits);

      set({
        ...data,
        ants, // Replace ants with the converted Ant objects
        enemies, // Replace enemies with the converted Enemy objects
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

    const ants = convertAnts(colonyState.ants);
    const enemies = colonyState.enemies.map((enemy) => Enemy.toData(enemy)); // Convert enemies to EnemyData
    const entityData = convertEntityObjectsToData(colonyState.mapEntities);

    const colonyInfo = {
      name: colonyState.name,
      ants:ants,
      enemies: enemies, // Include enemies in the payload
      mapEntities: entityData.mapEntityData,
      fruits: entityData.fruitData,
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
    set((state) => ({
      ...state,
      ...updates,
    }));
  },
}));

export const createFreshColony = () => {
  const nestEntrance = MapEntity.recreateNestEntrance();
  console.log("Nest entrance:", nestEntrance);
  const mapEntities = [nestEntrance, Fruit.createRandomFruit()];
  const queen = recreateQueen();
  queen.coords = {
    x: nestEntrance.coords.x + nestEntrance.size.width / 2.5,
    y: nestEntrance.coords.y + nestEntrance.size.height / 3,
  };
  const enemy = createEnemy(); // Create an enemy

  const ants = [queen, makeNewAnt(AntTypes.Soldier), makeNewAnt(AntTypes.Worker), makeNewAnt(),makeNewAnt(),makeNewAnt(),makeNewAnt(),makeNewAnt()];

  return {
    ants: ants,
    enemies: [enemy], // Initialize enemies
    name: "New Colony",
    map: "nest",
    eggs: 5,
    food: 200,
    sand: 200,
    age: 0,
    mapEntities: mapEntities,
    perkPurchased: [],
    initialized: true,
  };
};

const convertEntityObjectsToData = (mapEntities: MapEntity[]): { mapEntityData: MapEntityData[]; fruitData: FruitData[] } => {
  var mapEntityData: MapEntityData[] = [];
  var fruitData: FruitData[] = [];

  mapEntities.forEach((entity) => {
    if (entity instanceof Fruit) {
      fruitData.push(entity.toFruitData());
    } else {
      mapEntityData.push(entity.toMapEntityData());
    }
  });
  return {
    mapEntityData: mapEntityData,
    fruitData: fruitData,
  };
};
