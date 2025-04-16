import { v4 } from "uuid";
import { defaultFruitAmount, fruitSize } from "../contexts/settingsStore";
import { Bounds, drawFruit, findRandomCoords, getEntityBounds } from "../gameLogic/entityHelperFunctions";
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

  draw(ctx: CanvasRenderingContext2D, bounds: Bounds = getEntityBounds(this)) {
    drawFruit(ctx, this.row, this.col, bounds);
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
  static spriteDim = 16;
  static validCols = [0, 1, 2];
  // static validCols = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37];

  static fruitStagesChart = [
    [[0, 1, 2, 4], [3], [5]],
    [[0, 1, 2, 4], [3], [5]],
    [[0, 1, 2, 4], [3], [5]],
  ];

  setRow = (stage: number): number => {
    const validRows = Fruit.fruitStagesChart[this.col][stage];
    this.row = validRows[Math.floor(Math.random() * validRows.length)];
    return this.row;
  };
}