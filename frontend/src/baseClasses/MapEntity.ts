// Define the EntityTypeEnum type
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