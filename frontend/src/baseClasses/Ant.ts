import { v4 } from "uuid";
import { useColonyStore } from "../contexts/colonyStore";
import { carriedEntitySize, queenSpeed, soldierCarryingCapacity, soldierSpeed, useSettingsStore, workerCarryingCapacity, workerSpeed } from "../contexts/settingsStore";
import { getRandomAntType } from "../gameLogic/antHelperFunctions";
import { antNames } from "./antNames";
import { Fruit } from "./Fruit";
import { EntityTypeEnum, MapEntity } from "./MapEntity";

// Define the TaskEnum type
export enum TaskTypes {
  Idle = "idle",
  Forage = "forage",
  Attack = "attack",
  Patrol = "patrol",
}

export enum AntTypes {
  Queen = "queen",
  Worker = "worker",
  Soldier = "soldier",
}

export type CarryingData = {
  imgName: string; // Name of the image associated with the carried item
  amount: number; // Amount of the resource being carried
  col?: number; // Column of the grid (optional)
  row?: number; // Row of the grid (optional)
};

export type AntData = {
  id: string; // Unique identifier for the ant
  name: string; // Name of the ant
  age: number; // Age of the ant
  type: string; // Type of the ant (e.g., worker, soldier, queen)
  task: TaskTypes; // Current task of the ant
  hp: number; // Health points of the ant
  coords: { x: number; y: number }; // Absolute coordinates of the ant
  objective: string; // ID of the objective entity the ant is interacting with
  destination: string; // ID of the object the ant is heading to
  carrying:  CarryingData| null; // Resource the ant is carrying
  carryingCapacity: number; // Maximum carrying capacity of the ant
  speed: number; // Speed of the ant
  sizeFactor: number; // Size factor of the ant
};

// Define the Ant class
export class Ant {
  id: string;
  name: string;
  age: number;
  type: AntTypes;
  task: TaskTypes;
  coords: { x: number; y: number }; // Renamed from position to coords
  objective: string; // Renamed from target to objective
  destination: string;
  movingTo: { x: number; y: number } = {x: 0 , y: 0}; // New field for frontend only
  anchorPoint: { x: number; y: number }= {x: 0 , y: 0}; // New field for frontend only
  carrying: MapEntity | null; // Updated to use MapEntity for frontend
  carryingCapacity: number; // Moved carryingCapacity above amountCarried
  speed: number; // Added speed field
  frame: number = 0; // Moved above spriteFrameTimer
  spriteFrameTimer: number = 0; // Timer for sprite frame animation
  angle: number = 0; // Direction the ant is facing (e.g., in degrees)
  isBusy: boolean = false; // New field: Indicates if the ant is currently busy
  sizeFactor: number = 1; // Added sizeFactor field
  movementInitialized: boolean = false; // New field: Indicates if movement has been initialized (frontend only)
  isDead: boolean = false; // New field: Indicates if the ant is dead
  hp: number; // New field: Health points

  constructor(antData: AntData) {
    this.id = antData.id;
    this.name = antData.name;
    this.age = antData.age;
    this.type = antData.type as AntTypes;
    this.task = antData.task;
    this.coords = antData.coords; // Initialize coords field
    this.objective = antData.objective; // Initialize objective field
    this.destination = antData.destination;
    this.movingTo = { x: 0, y: 0 };
    this.anchorPoint = { x: 0, y: 0 };
    this.carrying = this.convertCarryingToData(antData.carrying); // Initialize carrying field
    this.carryingCapacity = antData.carryingCapacity; // Initialize carryingCapacity field
    this.speed = antData.speed; // Initialize speed field
    this.frame = 0; // Default value for frame
    this.spriteFrameTimer = 0; // Default value for sprite frame timer
    this.angle = Math.random() * Math.PI * 2; // Default value for orientation
    this.isBusy = false; // Default value for isBusy
    this.sizeFactor = antData.sizeFactor; // Initialize sizeFactor field
    this.movementInitialized = false; // Default value for movementInitialized
    this.hp = antData.hp; // Initialize hp
  }

  convertCarryingToData(carryingData: CarryingData | null): MapEntity | null {
    if (carryingData) {
      if (carryingData.col !== undefined && carryingData.row !== undefined) {
        const fruit = new Fruit(
          { x: 0, y: 0 },
          carryingData.amount,
          carryingData.col,
          carryingData.row,
          1
        );
        fruit.size = carriedEntitySize;
        return fruit;
      } else {
        return new MapEntity(
          v4(),
          EntityTypeEnum.FoodResource,
          { x: 0, y: 0 },
          carriedEntitySize,
          carryingData.amount,
          carryingData.imgName
        );
      }
    } else {
      return null; // Default value for carrying
    }
  }

  updateSpriteFrame(delta: number) {
    // Update the sprite frame based on the task and time elapsed
    var updateInterval;
    switch (this.type) {
      case AntTypes.Soldier:
        updateInterval = 150; // Soldier ants
        break;
      case AntTypes.Worker:
        updateInterval = 100; // Worker ants
        break;
      default:
        updateInterval = 150; // Default for other types
    }
    if (this.isBusy) {
      updateInterval *= 0.5;
    }

    if (this.task === TaskTypes.Idle) {
      updateInterval *= 2; // Slow down the animation when idle
    }

    this.spriteFrameTimer += delta;
    if (this.spriteFrameTimer >= updateInterval) {
      this.frame = (this.frame + 1) % 3; // Cycle through 3 frames
      this.spriteFrameTimer -= updateInterval;
    }
  }

  toAntData(): AntData {
    var carryingData: CarryingData | null = null;
    if (this.carrying instanceof Fruit){
      carryingData = {
        imgName: this.carrying.imgName,
        amount: this.carrying.amount,
        col: this.carrying.col,
        row: this.carrying.row,
      };
    } else if (this.carrying instanceof MapEntity) {
      carryingData = {
        imgName: this.carrying.imgName,
        amount: this.carrying.amount,
      };
    } else {
      carryingData = null; // Default value for carrying
    }
      return {
      id: this.id,
      name: this.name,
      age: this.age,
      type: this.type,
      task: this.task,
      coords: this.coords, // Include coords field
      objective: this.objective, // Include objective field
      destination: this.destination,
      carrying: carryingData, // Include carrying field
      carryingCapacity: this.carryingCapacity, // Include carryingCapacity field
      speed: this.speed, // Include speed field
      sizeFactor: this.sizeFactor, // Include sizeFactor field
      hp: this.hp, // Include hp field
    };
  }

  randomlyRotate() {
    this.angle = Math.random() * Math.PI * 2; }

  setAngle() {
    const dx = this.movingTo.x - this.coords.x;
    const dy = this.movingTo.y - this.coords.y;
    this.angle = Math.atan2(dy, dx) + Math.PI / 2; // Arc tangent to get the angle in radians
  }

  receiveAttack(damage: number): boolean {
    this.hp -= damage; // Decrease HP by the damage amount
    if (this.hp <= 0) {
      this.die();
      return true; // Ant is dead
    } else { return false; }
  }

  drawHpBar(ctx: CanvasRenderingContext2D) {
    const htBarWidth = AntTypeInfo[this.type].defaultHp / 3;
    const hpBarHeight = 4;
    const hpBarYOffset =  - this.sizeFactor * AntTypeInfo[this.type].hpBarYOffset; // Y offset for the HP bar
    const hpPercent = this.hp / AntTypeInfo[this.type].defaultHp; // Calculate the percentage of HP remaining

    ctx.fillStyle = "black"; // Background color
    ctx.fillRect(-htBarWidth / 2, hpBarYOffset, htBarWidth, hpBarHeight); // Draw the background bar

    ctx.fillStyle = "red"; // Foreground color
    ctx.fillRect(-htBarWidth / 2, hpBarYOffset, htBarWidth * hpPercent, hpBarHeight); // Draw the foreground bar
  }

  die(){
    const { ants, updateColony } = useColonyStore.getState();
    const newAnts = ants.filter((ant) => ant.id !== this.id);
    updateColony({ ants: newAnts });
    this.isDead = true; // Mark the ant as dead
  }
}

// Method to create a new Ant object
export const makeNewAnt = (type = getRandomAntType()): Ant => {
  const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
  const sizeFactor = Math.random() * 0.15 + 0.925; // Random sizeFactor between 0.95 and 1.05
  const speed = (type === AntTypes.Soldier ? soldierSpeed : workerSpeed) * (sizeFactor * sizeFactor);
  const carryingCapacity = Math.floor((type === AntTypes.Soldier ? soldierCarryingCapacity : workerCarryingCapacity)
   * (Math.random() / 3 + 0.833));
  const hp = AntTypeInfo[type].defaultHp; // Get hp from AntTypeInfo

  const antData: AntData = {
    id: v4(),
    name: antNames[Math.floor(Math.random() * antNames.length)],
    age: 0,
    type: type,
    task: TaskTypes.Idle,
    coords: { 
      x: Math.random() * canvasWidth - canvasWidth / 2, 
      y: Math.random() * canvasHeight - canvasHeight / 2 
    }, // Absolute coordinates
    objective: "", // Default value for objective
    destination: "",
    carrying: null, // Default value for carrying
    carryingCapacity: carryingCapacity, // Default value for carryingCapacity
    speed: speed, // Default value for speed
    sizeFactor: sizeFactor, // Random sizeFactor between 0.95 and 1.05
    hp: hp, // Default value for hp
  };
  return new Ant(antData);
};

// Function to recreate a queen ant
export const recreateQueen = (): Ant => {
  const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
  const antData: AntData = {
    id: v4(), // Generate a unique ID
    name: "Queenie", // Name of the queen
    age: 2, // Age of the queen
    type: AntTypes.Queen, // Type is queen
    task: TaskTypes.Idle, // Default task is idle
    coords: { 
      x: 0.75 * canvasWidth - canvasWidth / 2, 
      y: 0.6 * canvasHeight - canvasHeight / 2 
    }, // Absolute coordinates
    objective: "", // No objective initially
    destination: "", // No destination initially
    carrying: null, // Default value for carrying
    carryingCapacity: 0, // Queens do not carry resources
    speed: queenSpeed, // Very slow speed for the queen
    sizeFactor: 1.0, // Default sizeFactor for the queen
    hp: AntTypeInfo[AntTypes.Queen].defaultHp, // Default hp for the queen
  };
  return new Ant(antData);
};

export const convertAnts = (ants: Ant[]): AntData[] => {
  return ants.map((ant) => ant.toAntData());
};

export const convertAntData = (antData: AntData[]): Ant[] => {
  return antData.map((data) => new Ant(data));
};


export const AntTypeInfo: { [key in AntTypes]: { speed: number; carryingCapacity: number; defaultHp: number; hpBarYOffset: number; cost: number } } = {
  [AntTypes.Queen]: { speed: queenSpeed, carryingCapacity: 0, defaultHp: 200, hpBarYOffset: 30, cost: 1000 }, // Added Queen entry
  [AntTypes.Worker]: { speed: workerSpeed, carryingCapacity: workerCarryingCapacity, defaultHp: 40, hpBarYOffset: 17, cost: 20 },
  [AntTypes.Soldier]: { speed: soldierSpeed, carryingCapacity: soldierCarryingCapacity, defaultHp: 100, hpBarYOffset: 21, cost: 40 },
};