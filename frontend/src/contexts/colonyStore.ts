import { create } from "zustand";
import { getUserID } from "./userStore";

import { Ant, AntData, AntType, convertAntData, convertAnts, recreateQueen } from "../baseClasses/Ant";
import { createEnemy, Enemy, EnemyData } from "../baseClasses/Enemy";
import { Fruit, FruitData } from "../baseClasses/Fruit";
import { GameMap, Tile } from "../baseClasses/Map";
import { MapEntity, MapEntityData } from "../baseClasses/MapEntity"; // Import MapEntity
import { useWarningStore } from "../components/WarningBar";
import { vals } from "./globalVars";

// Define the ColonyStore type
type ColonyStore = {
  name: string;
  ants: Ant[];
  enemies: Enemy[]; // Add enemies field
  mapEntities: MapEntity[];
  eggs: number;
  food: number;
  chitin: number;
  age: number;
  map: Tile[][];
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
  chitin: 0,
  age: 0,
  map: [[]],
  perkPurchased: [],

  // Fetch a colony from the backend
  fetchColonyInfo: async () => {
    if (vals.offline_mode) {
      console.warn("Offline mode is enabled. Colony info will not be fetched from the backend.");
      return;
    }

    const userID = getUserID();
    if (!userID) {
      throw new Error("User ID is not set for fetchColonyInfo");
    }

    var response;
    try{
      response = await fetch(`http://localhost:8000/colonies/${userID}`);
    } catch (e) {
        console.error("Failed to fetch colony data.", e);
        startOfflineMode();
        return;
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
      vals.season = Math.floor(data.age / vals.seasonLength) % 4;
      GameMap.setTilesArray(data.map);

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
    if (vals.offline_mode) {
      console.warn("Offline mode is enabled. Colony info will not be sent to the backend.");
      return;
    }

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
      chitin: colonyState.chitin,
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

export const startOfflineMode = ()=>{
  console.warn("starting offline mode");
  const {updateColony} = useColonyStore.getState();
  const {startWarning} = useWarningStore.getState();
  vals.offline_mode = true;
  updateColony(createFreshColony());
  startWarning("Connection with backend failed. Starting online mode", 3000);
}

export const createFreshColony = () => {
  const nestEntrance = MapEntity.recreateNestEntrance();
  const mapEntities = [nestEntrance, Fruit.createRandomFruit(), Fruit.createRandomFruit(), Fruit.createRandomFruit(), Fruit.createRandomFruit(), Fruit.createRandomFruit(), Fruit.createRandomFruit(), Fruit.createRandomFruit(), Fruit.createRandomFruit(),];
  const queen = recreateQueen();
  queen.coords = {
    x: nestEntrance.coords.x + nestEntrance.size.width / 2.5,
    y: nestEntrance.coords.y + nestEntrance.size.height / 3,
  };
  const enemy = createEnemy(); // Create an enemy

  const ants = [queen, Ant.makeNewAnt(AntType.Soldier), Ant.makeNewAnt(AntType.Soldier), Ant.makeNewAnt(AntType.Soldier), Ant.makeNewAnt(AntType.Worker),
    Ant.makeNewAnt(AntType.Worker), Ant.makeNewAnt(AntType.Worker), Ant.makeNewAnt(),Ant.makeNewAnt(), Ant.makeNewAnt(), Ant.makeNewAnt(), Ant.makeNewAnt(), Ant.makeNewAnt(), Ant.makeNewAnt(),]

  GameMap.initializeMap();
  return {
    ants: ants,
    enemies: [enemy], // Initialize enemies
    name: "New Colony",
    map: GameMap.tilesGrid,
    eggs: 10,
    food: 200,
    chitin: 200,
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
