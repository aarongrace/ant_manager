abstract class Perk {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  abstract getDescription(): string;
}

export class Upgrade extends Perk {
  bonus: string; // Represents the gameplay bonus provided by the upgrade

  constructor(id: string, name: string, bonus: string) {
    super(id, name);
    this.bonus = bonus;
  }

  getDescription(): string {
    return `Upgrade: ${this.name} provides a bonus of ${this.bonus}.`;
  }
}

export class Cosmetic extends Perk {
  appearance: string; // Represents the cosmetic effect (e.g., skin, theme)

  constructor(id: string, name: string, appearance: string) {
    super(id, name);
    this.appearance = appearance;
  }

  getDescription(): string {
    return `Cosmetic: ${this.name} changes appearance to ${this.appearance}.`;
  }
}

export default Perk;