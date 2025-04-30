import { create } from "zustand";
import { getUserID } from "./userStore";

import { Ant, AntData, AntType, convertAntData, convertAnts, recreateQueen } from "../baseClasses/Ant";
import { createEnemy, Enemy, EnemyData } from "../baseClasses/Enemy";
import { EnemyCorpse, generateEnemyCorpse } from "../baseClasses/EnemyCorpse";
import { Fruit, FruitData } from "../baseClasses/Fruit";
import { GameMap, Tile } from "../baseClasses/Map";
import { MapEntity, MapEntityData } from "../baseClasses/MapEntity"; // Import MapEntity
import Perk, { Cosmetic, initializeDefaultUpgrades, PerkData, reapplyPerks, Upgrade } from "../baseClasses/Perk";
import { useWarningStore } from "../components/WarningBar";
import { vars } from "./globalVariables";

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
  perks: Perk[];
  fetchColonyInfo: () => Promise<void>;
  putColonyInfo: () => Promise<void>;
  updateColony: (updates: Partial<ColonyStore>) => void;
  test: {counter:number};
};

export const useColonyStore = create<ColonyStore>((set, get) => ({
  test: {counter: 0},
  name: "",
  ants: [],
  enemies: [],
  mapEntities: [],
  eggs: 5,
  food: 0,
  chitin: 0,
  age: 0,
  map: [[]],
  perks: [],

  // Fetch a colony from the backend
  fetchColonyInfo: async () => {
    if (vars.offline_mode) {
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
      const enemies = data.enemies?.
        map((enemy: EnemyData) => Enemy.fromData(enemy)) ?? []; 
      const mapEntities = data.mapEntities?.
        map(MapEntity.fromMapEntityData) ?? [];
      const perks = data.perks?.map((perkData:PerkData) => {
        if (perkData.isUpgrade){
          return new Upgrade(perkData)
        } else {
          return new Cosmetic(perkData)
        }
      }) ?? initializeDefaultUpgrades();
      console.log("mapEntities", mapEntities);
      const fruits = data.fruits?.map(Fruit.fromFruitData) ?? [];
      mapEntities.push(...fruits);
      vars.season = Math.floor(data.age / vars.seasonLength) % 4;
      if (data.map === undefined) {
        GameMap.initializeMap();
      } else {
        GameMap.setTilesArray(data.map);
      }
      reapplyPerks(perks);

      set({
        ...data,
        perks,
        ants, // Replace ants with the converted Ant objects
        enemies, // Replace enemies with the converted Enemy objects
        mapEntities, // Replace mapEntities with the converted MapEntity objects
      });
    }
  },

  // Send colony info to the backend
  putColonyInfo: async () => {
    if (vars.offline_mode) {
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
    const enemies = colonyState.enemies?.map(Enemy.toData)??[]; // Convert enemies to EnemyData
    const entityData = convertEntityObjectsToData(colonyState.mapEntities);
    const perksData = colonyState.perks?.map((perk) => perk.toData())??initializeDefaultUpgrades();

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
      perks: perksData,
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
  vars.offline_mode = true;
  updateColony(createFreshColony());
  startWarning("Connection with backend failed. Starting online mode", 3000);
}

export const createFreshColony = () => {
  const nestEntrance = MapEntity.recreateNestEntrance();
  const enemyCorpse = generateEnemyCorpse("mantis", 
    {x: GameMap.center.x - 100, y: GameMap.center.y - 100}, 10, {width: 50, height: 50});
  const mapEntities = [nestEntrance, Fruit.createRandomFruit(), 
    Fruit.createRandomFruit(), Fruit.createRandomFruit(), Fruit.createRandomFruit(), 
    Fruit.createRandomFruit(), Fruit.createRandomFruit(), Fruit.createRandomFruit(), 
    Fruit.createRandomFruit(),enemyCorpse];
  const queen = recreateQueen();
  queen.coords = {
    x: nestEntrance.coords.x + nestEntrance.size.width / 2.5,
    y: nestEntrance.coords.y + nestEntrance.size.height / 3,
  };
  const enemies = [createEnemy(), createEnemy()]; // Create an enemy
  const ants = [queen, Ant.makeNewAnt(AntType.Soldier), Ant.makeNewAnt(AntType.Soldier), Ant.makeNewAnt(AntType.Soldier), Ant.makeNewAnt(AntType.Worker),
    Ant.makeNewAnt(AntType.Worker), Ant.makeNewAnt(AntType.Worker), Ant.makeNewAnt(),Ant.makeNewAnt(), Ant.makeNewAnt(), Ant.makeNewAnt(), Ant.makeNewAnt(), Ant.makeNewAnt(), Ant.makeNewAnt(),]
  const perks = initializeDefaultUpgrades();
  GameMap.initializeMap();

  return {
    ants: ants,
    enemies: enemies, // Initialize enemies
    name: "New Colony",
    map: GameMap.tilesGrid,
    eggs: 10,
    food: 200,
    chitin: 200,
    age: 0,
    mapEntities: mapEntities,
    perks: perks,
    initialized: true,
  };
};

const convertEntityObjectsToData = (mapEntities: MapEntity[]): { mapEntityData: MapEntityData[]; fruitData: FruitData[] } => {
  var mapEntityData: MapEntityData[] = [];
  var fruitData: FruitData[] = [];

  mapEntities.forEach((entity) => {
    if (entity instanceof Fruit) {
      fruitData.push(entity.toFruitData());
    } else if (entity instanceof EnemyCorpse) {
      return;
    } else {
      mapEntityData.push(entity.toMapEntityData());
    }
  });
  return {
    mapEntityData: mapEntityData,
    fruitData: fruitData,
  };
};
