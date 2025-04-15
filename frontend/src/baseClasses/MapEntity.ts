import { v4 } from "uuid";
import { useColonyStore } from "../contexts/colonyStore";
import { findRandomPosition } from "../gameLogic/entityHelperFunctions";

export enum EntityTypeEnum {
  Gateway = "gateway",
  FoodResource = "foodResource",
}

// Define the MapEntity type
export type MapEntity = {
  id: string; // Unique identifier for the map entity
  type: EntityTypeEnum; // Type of the entity (e.g., gateway, foodResource)
  position: { x: number; y: number }; // Position of the entity (e.g., { x: 0.5, y: 0.8 })
  size: { width: number; height: number }; // Size of the entity (e.g., { width: 10, height: 20 })
  totalAmount: number; // Total amount of the resource (if applicable)
  remainingAmount: number; // Remaining amount of the resource (if applicable)
  imgName: string; // Name of the image associated with the entity
};

type foodSourceType = {
  name: string;
  default_amount: number;
  default_width: number;
  default_height: number;
};

export const foodSources: foodSourceType[] = [
  { name: "ham", default_amount: 50, default_width: 64, default_height: 48 },
];



// Function to create a random map entity
export const createRandomMapEntity = (): MapEntity | null => {
  const { mapEntities } = useColonyStore.getState();
  const minDistance = 0.1; // Minimum distance between entities
  const foodSource = foodSources[Math.floor(Math.random() * foodSources.length)];

  // Use the helper function to find a random valid position
  const position = findRandomPosition(minDistance);

  if (position) {
    const amount = Math.floor((Math.random() / 2 + 0.5) * foodSource.default_amount);

    // Return the new entity if a valid position is found
    return {
      id: v4(), // Generate a unique ID
      type: EntityTypeEnum.FoodResource, // Example type
      position,
      size: { width: foodSource.default_width, height: foodSource.default_height }, // Example size
      totalAmount: amount, // Example total amount
      remainingAmount: amount, // Example remaining amount
      imgName: foodSource.name, // Example image name
    };
  }

  // Return null if no valid position is found
  return null;
};

export const recreateNest = () => {
  return {
    id: v4(),
    type: EntityTypeEnum.Gateway,
    position: { x: 0.75, y: 0.6 },
    size: { width: 100, height: 100 },
    totalAmount: 1,
    remainingAmount: 1,
    imgName: "nest_entrance",
  };
};