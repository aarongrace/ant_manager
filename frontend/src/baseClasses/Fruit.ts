import { v4 } from "uuid";
import { usePreloadedImagesStore } from "../contexts/preloadImages";
import { defaultFruitAmount, fruitSize } from "../contexts/settingsStore";
import { Bounds, findRandomCoords, getEntityBounds } from "../gameLogic/entityHelperFunctions";
import { EntityTypeEnum, MapEntity } from "./MapEntity";

// Define the FruitRef type for backend communication
export type FruitRef = {
  id: string; // Unique identifier for the fruit
  coords: { x: number; y: number }; // Absolute coordinates of the fruit
  amount: number; // Amount of the resource
  col: number; // Column of the grid
  row: number; // Row of the grid
  stage: number; // Stage of the fruit (0-2)
  size: { width: number; height: number }; // Size of the fruit
};

export class Fruit extends MapEntity {
  col: number; // Column of the grid
  row: number; // Row of the grid
  stage: number; // Stage of the fruit (0-2)

  constructor(
    coords: { x: number; y: number } = { x: 0, y: 0 },
    amount: number,
    col: number,
    row: number,
    stage: number,
    size: { width: number; height: number } = { width: fruitSize, height: fruitSize }
  ) {
    super(v4(), EntityTypeEnum.FoodResource, coords, size, amount);
    this.col = col;
    this.row = row;
    this.stage = stage;
    this.imgName = "fruits";
    this.size = size;
  }

  // Convert the Fruit instance to a FruitRef object
  toFruitRef(): FruitRef {
    return {
      id: this.id,
      coords: this.coords,
      amount: this.amount,
      col: this.col,
      row: this.row,
      stage: this.stage,
      size: this.size, // Include size in the FruitRef
    };
  }

  draw(ctx: CanvasRenderingContext2D, bounds: Bounds = getEntityBounds(this), isHovered: boolean = false): void {
    const { images } = usePreloadedImagesStore.getState();
    const img = isHovered ?  images["fruits_hovered"]: images["fruits"];
    if (!img) {
      console.error(`Image for entity ${"fruits"} not loaded`);
      return;
    }
    ctx.drawImage(img,  this.col*Fruit.spriteDim, this.row*Fruit.spriteDim,  Fruit.spriteDim, Fruit.spriteDim, bounds.left, bounds.top, bounds.width, bounds.height);
  }

  // Static method to create a Fruit instance from a FruitRef
  static fromFruitRef(ref: FruitRef): Fruit {
    return new Fruit(ref.coords, ref.amount, ref.col, ref.row, ref.stage, ref.size);
  }

  // Static method to create a random fruit
  static createRandomFruit(): Fruit {
    var coords = findRandomCoords();
    if (!coords) {
      coords = { x: 0, y: 0 };
    }
    const col = this.validCols[Math.floor(Math.random() * this.validCols.length)];
    const row = this.fruitStagesChart[col][0][Math.floor(Math.random() * this.fruitStagesChart[col][0].length)];
    return new Fruit(
      coords,
      Math.random() * defaultFruitAmount / 2 + defaultFruitAmount / 2,
      col,
      row,
      1, // Default stage
      { width: fruitSize, height: fruitSize } // Default size
    );
  }

  decreaseAmount(decrease: number): void {
    this.amount -= decrease;
    if (this.amount <= defaultFruitAmount / 2 && this.stage == 1) {
      this.stage++;
      this.row = this.setRow(this.stage);
    } else if ( this.amount <= defaultFruitAmount * 0.75 && this.stage == 0) {
      this.stage++;
      this.row = this.setRow(this.stage);
    }
  }
  // pineapple: 11
  // blueberry: 16
  // eggplant: 25
  // red pepper: 30
  // red bell-pepper: 33
  static totalCols = 38;
  static spriteDim = 34;
  static validCols = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37];

  static fruitStagesChart = [
    [[0, 1, 2, 4], [3], [5]], // Row 0
    [[0, 1, 2, 4], [3], [5]], // Row 1
    [[0, 1, 2, 4], [3], [5]], // Row 2
    [[2, 3, 5], [4], [1, 2]], // Row 3
    [[2, 3, 5], [4], [1, 2]], // Row 4
    [[2, 3, 5], [4], [1, 2]], // Row 5
    [[1, 2, 3], [0, 1], [4, 5]], // Row 6
    [[1, 2, 3], [0, 1], [4, 5]], // Row 7
    [[1, 2, 3], [0, 1], [4, 5]], // Row 8
    [[1, 2], [0, 3], [4, 5]], // Row 9
    [[1, 2], [0, 3], [4, 5]], // Row 10
    [[1, 2], [0, 3], [4, 5]], // Row 11
    [[0, 1, 2, 3], [4], [5]], // Row 12
    [[0, 1, 2], [3], [4, 5]], // Row 13
    [[2, 5], [1, 4], [0, 3]], // Row 14
    [[2, 5], [1, 4], [0, 3]], // Row 15
    [[3, 4], [0, 1], [2, 5]], // Row 16
    [[0, 1], [2, 5], [3, 4]], // Row 17
    [[0, 1], [2, 5], [3, 4]], // Row 18
    [[0, 1], [2, 5], [3, 4]], // Row 19
    [[0, 1, 2, 3], [4], [5]], // Row 20
    [[0, 1, 2, 3], [4], [5]], // Row 21
    [[0, 1, 2], [3], [4, 5]], // Row 22
    [[0, 1, 2], [3], [4, 5]], // Row 23
    [[0, 1, 2], [3], [4, 5]], // Row 24
    [[0, 1, 2], [3], [4, 5]], // Row 25
    [[0, 1, 2], [3], [4, 5]], // Row 26
    [[0, 1, 2], [3], [4, 5]], // Row 27
    [[2, 3, 5], [0], [1, 4]], // Row 28
    [[2, 3, 5], [0], [1, 4]], // Row 29
    [[2, 3, 5], [0], [1, 4]], // Row 30
    [[0, 3, 5], [1], [2, 4]], // Row 31
    [[0, 3, 5], [1], [2, 4]], // Row 32
    [[0, 3, 5], [1], [2, 4]], // Row 33
    [[0, 1, 5], [2, 3], [4]], // Row 34
    [[0, 2, 4], [1, 3], [5]], // Row 35
    [[0, 2, 4], [1, 3], [5]], // Row 36
    [[0, 1, 2, 3], [4], [5]], // Row 37
  ];

  setRow = (stage: number): number => {
    const validRows = Fruit.fruitStagesChart[this.col][stage];
    this.row = validRows[Math.floor(Math.random() * validRows.length)];
    return this.row;
  };
}