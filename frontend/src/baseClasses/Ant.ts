// Define the TaskEnum type
export enum TaskEnum {
  Idle = "idle",
  Foraging = "foraging", // Renamed from "gathering food" to "foraging"
  Attacking = "attacking",
}

export enum TypeEnum {
    Queen = "queen",
    Worker = "worker",
    Soldier = "soldier",
}

// Define the Ant type
export type Ant = {
  id: string; // Unique identifier for the ant
  name: string; // Name of the ant
  age: number; // Age of the ant
  type: TypeEnum; // Type of the ant (e.g., worker, soldier, queen)
  color: string; // Color of the ant
  task: TaskEnum; // Current task of the ant (enum type)
  position: { x: number; y: number }; // Current position of the ant
  destination: string; // id of the object the ant is heading to
};