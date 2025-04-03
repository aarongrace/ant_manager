import Perk from "./Perk";

export default class Colony {
  id: string;
  owner: string; // User ID
  name: string;
  map: string;
  ants: number; // Changed to number for better representation
  age: number;
  food: number;
  sand: number;
  perkPurchased: Perk[]; // Changed to Perk[]

  constructor(
    id: string,
    owner: string,
    name: string,
    map: string,
    ants: number,
    age: number,
    food: number,
    sand: number,
    perkPurchased: Perk[]
  ) {
    this.id = id;
    this.owner = owner;
    this.name = name;
    this.map = map;
    this.ants = ants;
    this.age = age;
    this.food = food;
    this.sand = sand;
    this.perkPurchased = perkPurchased;
  }
}

export const sampleColony = new Colony(
  "sample1",
  "user1",
  "Sample Colony",
  "map1",
  5,
  2,
  50,
  100,
  []
)