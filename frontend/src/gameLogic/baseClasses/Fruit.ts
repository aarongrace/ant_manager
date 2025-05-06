import { v4 } from "uuid";
import { vars } from "../../contexts/globalVariables"; // Updated to use env
import { usePreloadedImagesStore } from "../../contexts/preloadImages";
import { findValidEntityCoords, getEntityBounds } from "../entityHelperFunctions";
import { GameMap } from "./Map";
import { EntityType, MapEntity } from "./MapEntity";
import { Bounds } from "./Models";

export type FruitData = {
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
  hoverable: boolean = true;

  constructor(
    coords: { x: number; y: number } = { x: GameMap.center.x, y: GameMap.center.y },
    amount: number,
    col: number,
    row: number,
    stage: number,
    size: { width: number; height: number } = { width: vars.food.fruitSize, height: vars.food.fruitSize } // Updated to use env
  ) {
    super(v4(), EntityType.FoodResource, coords, size, amount);
    this.col = col;
    this.row = row;
    this.stage = stage;
    this.imgName = "fruits";
    this.size = size;
  }

  toFruitData(): FruitData {
    return {
      id: this.id,
      coords: this.coords,
      amount: this.amount,
      col: this.col,
      row: this.row,
      stage: this.stage,
      size: this.size,
    };
  }

  draw(ctx: CanvasRenderingContext2D, bounds: Bounds = getEntityBounds(this)): void {
    const { getImage } = usePreloadedImagesStore.getState();
    const img = this.isHovered ? getImage("fruits_hovered") : getImage("fruits");
    if (!img) {
      console.error(`Image for entity ${"fruits"} not loaded`);
      return;
    }
    ctx.drawImage(
      img,
      this.col * Fruit.spriteDim,
      this.row * Fruit.spriteDim,
      Fruit.spriteDim,
      Fruit.spriteDim,
      bounds.left,
      bounds.top,
      bounds.width,
      bounds.height
    );
  }

  static fromFruitData(ref: FruitData): Fruit {
    return new Fruit(ref.coords, ref.amount, ref.col, ref.row, ref.stage, ref.size);
  }

  // Static method to create a random fruit
  static createRandomFruit(coords = findValidEntityCoords()): Fruit {
    if (!coords) {
      coords = { x: GameMap.center.x, y: GameMap.center.y }; // Default to center if no valid coords found
    }
    const col = this.validCols[Math.floor(Math.random() * this.validCols.length)];
    const row = this.fruitStagesChart[col][0][Math.floor(Math.random() * this.fruitStagesChart[col][0].length)];
    return new Fruit(
      coords,
      Math.random() * vars.food.defaultFruitAmount / 2 + vars.food.defaultFruitAmount / 2, // Updated to use env
      col,
      row,
      1, // Default stage
      { width: vars.food.fruitSize, height: vars.food.fruitSize } // Updated to use env
    );
  }

  decreaseAmount(decrease: number): void {
    this.amount -= decrease;
    if (this.amount <= vars.food.defaultFruitAmount / 2 && this.stage == 1) { // Updated to use env
      this.stage++;
      this.row = this.setRow(this.stage);
    } else if (this.amount <= vars.food.defaultFruitAmount * 0.75 && this.stage == 0) { // Updated to use env
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
  static validCols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37];

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