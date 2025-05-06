import { v4 } from "uuid";
import { vars } from "../../contexts/globalVariables"; // Updated to use env
import { usePreloadedImagesStore } from "../../contexts/preloadImages";
import { findOrRemoveAntForFoodSource } from "../antHelperFunctions";
import { findValidEntityCoords, getEntityBounds } from "../entityHelperFunctions";
import { GameMap } from "./Map";
import { Bounds, InteractiveElement } from "./Models";

export enum EntityType {
  Gateway = "gateway",
  FoodResource = "foodResource",
  ChitinSource = "chitinSource",
}

export type MapEntityData = {
  id: string; // Unique identifier for the map entity
  type: EntityType; // Type of the entity (e.g., gateway, foodResource)
  coords: { x: number; y: number }; // Absolute coordinates of the entity
  size: { width: number; height: number }; // Size of the entity
  amount: number; // Amount of the resource
  imgName: string; // Name of the image associated with the entity
};

export class MapEntity implements InteractiveElement {
  id: string; // Unique identifier for the map entity
  type: EntityType; // Type of the entity (e.g., gateway, foodResource)
  coords: { x: number; y: number }; // Absolute coordinates of the entity (e.g., { x: -100, y: 50 })
  size: { width: number; height: number }; // Size of the entity (e.g., { width: 10, height: 20 })
  amount: number; // Amount of the resource (if applicable)
  imgName: string; // Name of the image associated with the entity
  clickable: boolean = true; // Whether the entity is clickable or not
  hoverable: boolean = false;
  isHovered: boolean = false;

  constructor(
    id: string = v4(),
    type: EntityType = EntityType.FoodResource,
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
    this.clickable = this.type !== EntityType.Gateway;
  }

  toMapEntityData(): MapEntityData {
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

  static fromMapEntityData(data: MapEntityData): MapEntity {
    return new MapEntity(
      data.id,
      data.type,
      data.coords,
      data.size,
      data.amount,
      data.imgName
    );
  }

  getBounds = () => getEntityBounds(this);

  draw(ctx: CanvasRenderingContext2D, bounds: Bounds = this.getBounds()): void {
    const { getImage } = usePreloadedImagesStore.getState();
    const hoveredImgName = `${this.imgName}_hovered`;
    var img = this.isHovered ? getImage(hoveredImgName) : getImage(this.imgName);
    if (this.isHovered && !img) {
      img = getImage(this.imgName);
    }
    if (!img) {
      console.error(`Image for entity ${this.imgName} not loaded`);
      return;
    }
    ctx.drawImage(img, bounds.left, bounds.top, bounds.width, bounds.height);
  }

  onClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    findOrRemoveAntForFoodSource(this, event.button === 2);
  };

  // Static method to create a random map entity
  static createRandomMapEntity(coords = findValidEntityCoords()): MapEntity {
    // the last food source is reserved for fruits and should not be included in the random selection
    const validFoodSources = foodSources.filter((source) => source.name !== "fruits");
    const foodSource = validFoodSources[Math.floor(Math.random() * validFoodSources.length)];
    if (!coords) {
      coords = {
        x: GameMap.center.x + Math.random() * 100 - 50,
        y: GameMap.center.y + Math.random() * 100 - 50,
      };
    }

    const amount = Math.floor((Math.random() / 2 + 0.5) * foodSource.default_amount);
    return new MapEntity(
      v4(),
      EntityType.FoodResource,
      coords,
      { width: foodSource.default_width, height: foodSource.default_height },
      amount,
      foodSource.name
    );
  }

  // Static method to recreate the nest entrance
  static recreateNestEntrance(): MapEntity {
    return new MapEntity(
      v4(),
      EntityType.Gateway,
      GameMap.getCoordsCloseToCenter(100),
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
  { name: "ham", default_amount: 50, default_width: 48, default_height: 36 },
  {
    name: "fruits",
    default_amount: vars.food.defaultFruitAmount, // Updated to use env
    default_width: vars.food.fruitSize, // Updated to use env
    default_height: vars.food.fruitSize, // Updated to use env
  },
];

