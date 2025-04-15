import { v4 } from "uuid";
import { antNames } from "./antNames";
import { SoldierCarryingCapacity, WorkerCarryingCapacity } from "../contexts/settingsStore";

// Define the TaskEnum type
export enum TaskEnum {
  Idle = "idle",
  Foraging = "foraging", // Renamed from "gathering food" to "foraging"
  Attacking = "attacking",
}

export enum AntTypeEnum {
  Queen = "queen",
  Worker = "worker",
  Soldier = "soldier",
}


// Define the AntRef type for database communication
export type AntRef = {
  id: string;
  name: string;
  age: number;
  type: AntTypeEnum;
  task: TaskEnum;
  position: { x: number; y: number };
  destination: string;
  carrying: string;
  amountCarried: number;
};

// Define the Ant class
export class Ant {
  id: string;
  name: string;
  age: number;
  type: AntTypeEnum;
  task: TaskEnum;
  position: { x: number; y: number };
  destination: string;
  carrying: string;
  amountCarried: number;
  frame: number; // Moved above spriteFrameTimer
  spriteFrameTimer: number; // Timer for sprite frame animation
  angle: number; // Direction the ant is facing (e.g., in degrees)
  targetOffsets: { x: number; y: number }; // New field: Offsets for targeting

  constructor(antRef: AntRef) {
    this.id = antRef.id;
    this.name = antRef.name;
    this.age = antRef.age;
    this.type = antRef.type;
    this.task = antRef.task;
    this.position = antRef.position;
    this.destination = antRef.destination;
    this.carrying = antRef.carrying;
    this.amountCarried = antRef.amountCarried;
    this.frame = 0; // Default value for frame
    this.spriteFrameTimer = 0; // Default value for sprite frame timer
    this.angle = 0; // Default value for orientation
    this.targetOffsets = { x: 0.0, y: 0.0 }; // Default value for target offsets
  }

  updateSpriteFrame(delta: number) {
    // Update the sprite frame based on the task and time elapsed
    this.spriteFrameTimer += delta;
    if (this.spriteFrameTimer >= 100) {
      this.frame = (this.frame + 1) % 3; // Cycle through 3 frames
      this.spriteFrameTimer -= 100;
    }
  }

  // Convert the Ant instance to an AntRef object
  toAntRef(): AntRef {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      type: this.type,
      task: this.task,
      position: this.position,
      destination: this.destination,
      carrying: this.carrying,
      amountCarried: this.amountCarried,
    };
  }
}

// Method to create a new Ant object
export const makeNewAnt = (): Ant => {
  const antRef: AntRef = {
    id: v4(),
    name: antNames[Math.floor(Math.random() * antNames.length)],
    age: 0,
    type: getRandomAntType(),
    task: TaskEnum.Idle,
    position: { x: Math.random(), y: Math.random() },
    destination: "",
    carrying: "",
    amountCarried: 0,
  };
  return new Ant(antRef);
};

// Global method to convert an array of Ant objects to AntRef objects
export const convertAnts = (ants: Ant[]): AntRef[] => {
  return ants.map((ant) => ant.toAntRef());
};

// Global method to convert an array of AntRef objects to Ant objects
export const convertAntRefs = (antRefs: AntRef[]): Ant[] => {
  return antRefs.map((antRef) => new Ant(antRef));
};

// Helper method to get a random AntType
const getRandomAntType = (): AntTypeEnum => {
  const antTypes = Object.values(AntTypeEnum).filter(
    (antType) => antType !== AntTypeEnum.Queen
  ) as AntTypeEnum[];
  return antTypes[Math.floor(Math.random() * antTypes.length)];
};


export const getCarryingCapacity = (antType:AntTypeEnum): number => {
  switch (antType) {
    case AntTypeEnum.Soldier:
      return SoldierCarryingCapacity;
    case AntTypeEnum.Worker:
      return WorkerCarryingCapacity;
    default:
      return 0; // Default carrying capacity for unknown types
  }
}