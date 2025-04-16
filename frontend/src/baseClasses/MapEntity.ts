import { v4 } from "uuid";
import { useSettingsStore } from "../contexts/settingsStore";
import { findRandomCoords } from "../gameLogic/entityHelperFunctions"; // Renamed import

export enum EntityTypeEnum {
  Gateway = "gateway",
  FoodResource = "foodResource",
}

// Define the MapEntity type
export type MapEntity = {
  id: string; // Unique identifier for the map entity
  type: EntityTypeEnum; // Type of the entity (e.g., gateway, foodResource)
  coords: { x: number; y: number }; // Absolute coordinates of the entity (e.g., { x: -100, y: 50 })
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
  const foodSource = foodSources[Math.floor(Math.random() * foodSources.length)];

  // Generate random absolute coordinates
  const coords = findRandomCoords();
  const amount = Math.floor((Math.random() / 2 + 0.5) * foodSource.default_amount);
  if (!coords) {
    return null; // Return null if no valid coordinates are found
  }

  // Return the new entity if a valid position is found
  return {
    id: v4(), // Generate a unique ID
    type: EntityTypeEnum.FoodResource, // Example type
    coords,
    size: { width: foodSource.default_width, height: foodSource.default_height }, // Example size
    totalAmount: amount, // Example total amount
    remainingAmount: amount, // Example remaining amount
    imgName: foodSource.name, // Example image name
  };
};

export const recreateNestEntrance = (): MapEntity => {
  const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
  return {
    id: v4(),
    type: EntityTypeEnum.Gateway,
    coords: {
      x: 0.75 * canvasWidth - canvasWidth / 2,
      y: 0.6 * canvasHeight - canvasHeight / 2,
    },
    size: { width: 100, height: 100 },
    totalAmount: 1,
    remainingAmount: 1,
    imgName: "nest_entrance",
  };
};