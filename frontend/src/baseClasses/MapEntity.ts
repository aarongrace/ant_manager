// Define the EntityTypeEnum type
import { v4 } from "uuid";
import { useColonyStore } from "../contexts/colonyStore";

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

type foodSourceType ={
  name: string;
  default_amount: number;
  default_width: number;
  default_height: number;
}

export const foodSources: foodSourceType[] = [
  { name: "ham", default_amount:50, default_width: 50, default_height: 50 },]

export const createRandomMapEntity = (): MapEntity | null => {
  const { mapEntities } = useColonyStore.getState();
  const maxAttempts = 100; // Maximum number of attempts to find a valid position
  const minDistance = 0.1; // Minimum distance between entities

  const foodSource = foodSources[Math.floor(Math.random() * foodSources.length)];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const position = { x: Math.random() * 0.9 + 0.05, y: Math.random()* 0.93 + 0.035 }; // Random position within the canvas

    // Check if the position is valid
    const isValid = mapEntities.every((entity) => {
      const dx = entity.position.x - position.x;
      const dy = entity.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance >= minDistance;
    });

    const amount = Math.floor((Math.random()/2+0.5) *foodSource.default_amount);

    if (isValid) {
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
  }

  // Return null if no valid position is found
  console.warn("No valid position found for the new map entity.");
  return null;
};
