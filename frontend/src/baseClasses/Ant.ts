import { v4 } from "uuid";
import { antNames } from "./antNames";
import { soldierCarryingCapacity, soldierSpeed, workerCarryingCapacity, workerSpeed } from "../contexts/settingsStore";

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
  target: string; // Added target field
  destination: string;
  carrying: string;
  amountCarried: number;
  speed: number; // Added speed field
  carryingCapacity: number; // Added carryingCapacity field
};

// Define the Ant class
export class Ant {
  id: string;
  name: string;
  age: number;
  type: AntTypeEnum;
  task: TaskEnum;
  position: { x: number; y: number };
  target: string; // Added target field
  destination: string;
  carrying: string;
  amountCarried: number;
  speed: number; // Added speed field
  carryingCapacity: number; // Added carryingCapacity field
  frame: number; // Moved above spriteFrameTimer
  spriteFrameTimer: number; // Timer for sprite frame animation
  angle: number; // Direction the ant is facing (e.g., in degrees)
  destOffsets: { x: number; y: number }; // New field: Offsets for targeting
  isBusy: boolean; // New field: Indicates if the ant is currently busy

  constructor(antRef: AntRef) {
    this.id = antRef.id;
    this.name = antRef.name;
    this.age = antRef.age;
    this.type = antRef.type;
    this.task = antRef.task;
    this.position = antRef.position;
    this.target = antRef.target; // Initialize target field
    this.destination = antRef.destination;
    this.carrying = antRef.carrying;
    this.amountCarried = antRef.amountCarried;
    this.speed = antRef.speed; // Initialize speed field
    this.carryingCapacity = antRef.carryingCapacity; // Initialize carryingCapacity field
    this.frame = 0; // Default value for frame
    this.spriteFrameTimer = 0; // Default value for sprite frame timer
    this.angle = 0; // Default value for orientation
    this.destOffsets = { x: 0.0, y: 0.0 }; // Default value for target offsets
    this.isBusy = false; // Default value for isBusy
  }

  updateSpriteFrame(delta: number) {
    // Update the sprite frame based on the task and time elapsed
    var updateInterval;
    switch (this.type) {
      case AntTypeEnum.Soldier:
        updateInterval = 150; // Soldier ants
        break;
      case AntTypeEnum.Worker:
        updateInterval = 100; // Worker ants
        break;
      default:
        updateInterval = 200; // Default for other types
    }
    if (this.isBusy) {
      updateInterval *= 0.5;
    }

    this.spriteFrameTimer += delta;
    if (this.spriteFrameTimer >= updateInterval) {
      this.frame = (this.frame + 1) % 3; // Cycle through 3 frames
      this.spriteFrameTimer -= updateInterval;
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
      target: this.target, // Include target field
      destination: this.destination,
      carrying: this.carrying,
      amountCarried: this.amountCarried,
      speed: this.speed, // Include speed field
      carryingCapacity: this.carryingCapacity, // Include carryingCapacity field
    };
  }
}

// Method to create a new Ant object
export const makeNewAnt = (): Ant => {
  const type = getRandomAntType();
  const speed = (type === AntTypeEnum.Soldier ? soldierSpeed : workerSpeed) * (Math.random() / 4 + 0.875);
  const carryingCapacity = Math.floor((type === AntTypeEnum.Soldier ? soldierCarryingCapacity : workerCarryingCapacity)
   * (Math.random() / 3 + 0.833));

  const antRef: AntRef = {
    id: v4(),
    name: antNames[Math.floor(Math.random() * antNames.length)],
    age: 0,
    type: type,
    task: TaskEnum.Idle,
    position: { x: Math.random(), y: Math.random() },
    target: "", // Default value for target
    destination: "",
    carrying: "",
    amountCarried: 0,
    speed: speed, // Default value for speed
    carryingCapacity: carryingCapacity, // Default value for carryingCapacity
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
