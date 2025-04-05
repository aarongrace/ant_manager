class Settings {
  food_per_ant: number;
  sand_per_square: number;

  constructor(food_per_ant: number, sand_per_square: number) {
    this.food_per_ant = food_per_ant;
    this.sand_per_square = sand_per_square;
  }

  // Method to display settings (optional)
  displaySettings(): string {
    return `Food per Ant: ${this.food_per_ant}, Sand per Square: ${this.sand_per_square}`;
  }
}

export default Settings;