import { v4 } from "uuid";
import { defaultFruitAmount, fruitSize as fruitLength, useSettingsStore } from "../contexts/settingsStore";
import { Bounds, drawEntity, findRandomCoords, getEntityBounds } from "../gameLogic/entityHelperFunctions";

export enum EntityTypeEnum {
  Gateway = "gateway",
  FoodResource = "foodResource",
}

// Define the MapEntityRef type for backend communication
export type MapEntityRef = {
  id: string; // Unique identifier for the map entity
  type: EntityTypeEnum; // Type of the entity (e.g., gateway, foodResource)
  coords: { x: number; y: number }; // Absolute coordinates of the entity
  size: { width: number; height: number }; // Size of the entity
  amount: number; // Amount of the resource
  imgName: string; // Name of the image associated with the entity
};

export class MapEntity {
  id: string; // Unique identifier for the map entity
  type: EntityTypeEnum; // Type of the entity (e.g., gateway, foodResource)
  coords: { x: number; y: number }; // Absolute coordinates of the entity (e.g., { x: -100, y: 50 })
  size: { width: number; height: number }; // Size of the entity (e.g., { width: 10, height: 20 })
  amount: number; // Amount of the resource (if applicable)
  imgName: string; // Name of the image associated with the entity

  constructor(
    id: string = v4(),
    type: EntityTypeEnum = EntityTypeEnum.FoodResource,
    coords: { x: number; y: number } = { x: 0, y: 0 },
    size: { width: number; height: number } = { width: 10, height: 10 },
    amount: number = 100,
    imgName: string = "default"
  ) {
    this.id = id;
    this.type = type;
    this.coords = coords;
    this.size = size;
    this.amount = amount;
    this.imgName = imgName;
  }

  // Convert the MapEntity instance to a MapEntityRef object
  toMapEntityRef(): MapEntityRef {
    return {
      id: this.id,
      type: this.type,
      coords: this.coords,
      size: this.size,
      amount: this.amount,
      imgName: this.imgName,
    };
  }

  decreaseAmount(decrease: number) {
    this.amount -= decrease;
    if (this.amount <= 0) {
      this.amount = 0;
    }
  }

  // Static method to create a MapEntity from a MapEntityRef
  static fromMapEntityRef(ref: MapEntityRef): MapEntity {
    return new MapEntity(
      ref.id,
      ref.type,
      ref.coords,
      ref.size,
      ref.amount,
      ref.imgName
    );
  }


  getBounds = ()=> getEntityBounds(this);

  draw(ctx: CanvasRenderingContext2D, bounds:Bounds = this.getBounds()) {
    drawEntity(ctx, this.imgName, bounds);
  }

  // Static method to create a random map entity
  static createRandomMapEntity(): MapEntity {
    // the last food source is reserved for fruits and should not be included in the random selection
    const validFoodSources = foodSources.filter((source) => source.name !== "fruits");
    const foodSource = validFoodSources[Math.floor(Math.random() * validFoodSources.length)];
    var coords = findRandomCoords();
    if (!coords) {
      coords = {
        x: 0,
        y: 0,
      };
    }

    const amount = Math.floor((Math.random() / 2 + 0.5) * foodSource.default_amount);
    return new MapEntity(
      v4(),
      EntityTypeEnum.FoodResource,
      coords,
      { width: foodSource.default_width, height: foodSource.default_height },
      amount,
      foodSource.name
    );
  }


  // Static method to recreate the nest entrance
  static recreateNestEntrance(): MapEntity {
    const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
    return new MapEntity(
      v4(),
      EntityTypeEnum.Gateway,
      {
        x: 0.75 * canvasWidth - canvasWidth / 2,
        y: 0.6 * canvasHeight - canvasHeight / 2,
      },
      { width: 100, height: 100 },
      1,
      "nest_entrance"
    );
  }
}


type foodSourceType = {
  name: string;
  default_amount: number;
  default_width: number;
  default_height: number;
};

export const foodSources: foodSourceType[] = [
  { name: "ham", default_amount: 50, default_width: 64, default_height: 48 },
  { name: "fruits", default_amount: defaultFruitAmount, default_width: fruitLength, default_height: fruitLength },
];