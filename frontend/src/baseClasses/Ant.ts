import { v4 } from "uuid";
import { queenSpeed, soldierCarryingCapacity, soldierSpeed, useSettingsStore, workerCarryingCapacity, workerSpeed } from "../contexts/settingsStore";
import { antNames } from "./antNames";

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
  coords: { x: number; y: number }; // Renamed from position to coords
  objective: string; // Renamed from target to objective
  destination: string;
  movingTo: { x: number; y: number }; // New field for frontend only
  anchorPoint: { x: number; y: number }; // New field for frontend only
  carrying: string;
  amountCarried: number;
  speed: number; // Added speed field
  carryingCapacity: number; // Added carryingCapacity field
  sizeFactor: number; // Added sizeFactor field
};

// Define the Ant class
export class Ant {
  id: string;
  name: string;
  age: number;
  type: AntTypeEnum;
  task: TaskEnum;
  coords: { x: number; y: number }; // Renamed from position to coords
  objective: string; // Renamed from target to objective
  destination: string;
  movingTo: { x: number; y: number }; // New field for frontend only
  anchorPoint: { x: number; y: number }; // New field for frontend only
  carrying: string;
  carryingCapacity: number; // Moved carryingCapacity above amountCarried
  amountCarried: number;
  speed: number; // Added speed field
  frame: number; // Moved above spriteFrameTimer
  spriteFrameTimer: number; // Timer for sprite frame animation
  angle: number; // Direction the ant is facing (e.g., in degrees)
  isBusy: boolean; // New field: Indicates if the ant is currently busy
  sizeFactor: number; // Added sizeFactor field
  movementInitialized: boolean; // New field: Indicates if movement has been initialized (frontend only)

  constructor(antRef: AntRef) {
    this.id = antRef.id;
    this.name = antRef.name;
    this.age = antRef.age;
    this.type = antRef.type;
    this.task = antRef.task;
    this.coords = antRef.coords; // Initialize coords field
    this.objective = antRef.objective; // Initialize objective field
    this.destination = antRef.destination;
    this.movingTo = { x: 0, y: 0 }; 
    this.anchorPoint = { x: 0, y: 0 };
    this.carrying = antRef.carrying;
    this.carryingCapacity = antRef.carryingCapacity; // Initialize carryingCapacity field
    this.amountCarried = antRef.amountCarried;
    this.speed = antRef.speed; // Initialize speed field
    this.frame = 0; // Default value for frame
    this.spriteFrameTimer = 0; // Default value for sprite frame timer
    this.angle = Math.random() * Math.PI * 2; // Default value for orientation
    this.isBusy = false; // Default value for isBusy
    this.sizeFactor = antRef.sizeFactor; // Initialize sizeFactor field
    this.movementInitialized = false; // Default value for movementInitialized
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
        updateInterval = 150; // Default for other types
    }
    if (this.isBusy) {
      updateInterval *= 0.5;
    }

    if (this.task === TaskEnum.Idle) {
      updateInterval *= 2; // Slow down the animation when idle
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
      coords: this.coords, // Include coords field
      objective: this.objective, // Include objective field
      destination: this.destination,
      movingTo: this.movingTo, // Include movingTo field
      anchorPoint: this.anchorPoint, // Include anchorPoint field
      carrying: this.carrying,
      carryingCapacity: this.carryingCapacity, // Include carryingCapacity field
      amountCarried: this.amountCarried,
      speed: this.speed, // Include speed field
      sizeFactor: this.sizeFactor, // Include sizeFactor field
    };
  }

  randomlyRotate() {
    this.angle = Math.random() * Math.PI * 2; // Random angle between 0 and 2π
  }

  setAngle(){
    const dx = this.movingTo.x - this.coords.x;
    const dy = this.movingTo.y - this.coords.y;
    this.angle = Math.atan2(dy, dx) + Math.PI / 2; // Arc tangent to get the angle in radians
  }
}

// Method to create a new Ant object
export const makeNewAnt = (): Ant => {
  const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
  const type = getRandomAntType();
  const sizeFactor = Math.random() * 0.15 + 0.925; // Random sizeFactor between 0.95 and 1.05
  const speed = (type === AntTypeEnum.Soldier ? soldierSpeed : workerSpeed) * (sizeFactor * sizeFactor);
  const carryingCapacity = Math.floor((type === AntTypeEnum.Soldier ? soldierCarryingCapacity : workerCarryingCapacity)
   * (Math.random() / 3 + 0.833));

  const antRef: AntRef = {
    id: v4(),
    name: antNames[Math.floor(Math.random() * antNames.length)],
    age: 0,
    type: type,
    task: TaskEnum.Idle,
    coords: { 
      x: Math.random() * canvasWidth - canvasWidth / 2, 
      y: Math.random() * canvasHeight - canvasHeight / 2 
    }, // Absolute coordinates
    objective: "", // Default value for objective
    destination: "",
    movingTo: { x: 0.5, y: 0.5 }, // Default value for movingTo
    anchorPoint: { x: 0.5, y: 0.5 }, // Default value for anchorPoint
    carrying: "",
    carryingCapacity: carryingCapacity, // Default value for carryingCapacity
    amountCarried: 0,
    speed: speed, // Default value for speed
    sizeFactor: sizeFactor, // Random sizeFactor between 0.95 and 1.05
  };
  return new Ant(antRef);
};

// Function to recreate a queen ant
export const recreateQueen = (): Ant => {
  const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
  const antRef: AntRef = {
    id: v4(), // Generate a unique ID
    name: "Queenie", // Name of the queen
    age: 2, // Age of the queen
    type: AntTypeEnum.Queen, // Type is queen
    task: TaskEnum.Idle, // Default task is idle
    coords: { 
      x: 0.75 * canvasWidth - canvasWidth / 2, 
      y: 0.6 * canvasHeight - canvasHeight / 2 
    }, // Absolute coordinates
    objective: "", // No objective initially
    destination: "", // No destination initially
    movingTo: { x: 0.5, y: 0.5 }, // Default movingTo position
    anchorPoint: { x: 0.5, y: 0.5 }, // Default anchorPoint position
    carrying: "", // Not carrying anything initially
    carryingCapacity: 0, // Queens do not carry resources
    amountCarried: 0, // No resources carried
    speed: queenSpeed, // Very slow speed for the queen
    sizeFactor: 1.0, // Default sizeFactor for the queen
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

