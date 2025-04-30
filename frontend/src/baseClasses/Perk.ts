import { defaultVars, vars } from "../contexts/globalVariables";

export interface Perk {
  apply(): void;
  toData(): PerkData;
  amount: number;
  cost: number;
  name: string;
}

export type PerkData = {
  name: string;
  type: upgradeType | null;
  timesUpgraded: number | null;
  isPurchased: boolean | null;
  isUpgrade: boolean;
};


export enum upgradeType {
  workerSpeed = "workerSpeed",
  soldierSpeed = "soldierSpeed",
  soldierDamage = "soldierDamage",
  hpRecoveryRate = "hpRecoveryRate",
  carryingCapacity = "carryingCapacity",
  foodSpawnRate = "foodSpawnRate",
}

export const defaultUpgradeValues: Record<upgradeType, { base_cost: number; percentagePerUpgrade: number; name: string }> = {
  [upgradeType.workerSpeed]: { base_cost: 3, percentagePerUpgrade: 5, name: "Worker Speed" },
  [upgradeType.soldierSpeed]: { base_cost: 3, percentagePerUpgrade: 5, name: "Soldier Speed" },
  [upgradeType.soldierDamage]: { base_cost: 2, percentagePerUpgrade: 10, name: "Soldier Damage" },
  [upgradeType.hpRecoveryRate]: { base_cost: 1, percentagePerUpgrade: 10, name: "HP Recovery Rate" },
  [upgradeType.carryingCapacity]: { base_cost: 2, percentagePerUpgrade: 5, name: "Carrying Capacity" },
  [upgradeType.foodSpawnRate]: { base_cost: 3, percentagePerUpgrade: 5, name: "Food Spawn Rate" },
};

export const initializeDefaultUpgrades = ():Upgrade[]=>{
  const perks =  Object.values(upgradeType).map(type => 
    new Upgrade({
      type,
      name: defaultUpgradeValues[type].name,
      timesUpgraded: 0,
      isUpgrade: true,
      isPurchased: null,
    })
  );
  reapplyPerks(perks);
  return perks;
}

export class Upgrade implements Perk {
  type: upgradeType;
  base_cost: number;
  timesUpgraded: number;
  percentagePerUpgrade: number;
  name: string;
  amount: number=0;
  cost: number=0;

  constructor(upgradeData: PerkData){
    if (!upgradeData.isUpgrade || !upgradeData.type || upgradeData.timesUpgraded === null) {
      console.error("Invalid upgrade data:", upgradeData);
      throw new Error("Invalid upgrade data");
    }
    this.type = upgradeData.type;
    this.base_cost = defaultUpgradeValues[this.type].base_cost;
    this.percentagePerUpgrade = defaultUpgradeValues[this.type].percentagePerUpgrade;
    this.timesUpgraded = upgradeData.timesUpgraded;
    this.name = defaultUpgradeValues[this.type].name;
    this.setAmount();
    this.setCost();
  }

  toData():PerkData{
    return {
      type: this.type,
      name: this.name,
      timesUpgraded: this.timesUpgraded,
      isUpgrade: true,
      isPurchased: null,
    }
  }

  setAmount(): void {
    this.amount =  this.timesUpgraded * this.percentagePerUpgrade;
  }

  setCost(): void {
    this.cost = Math.floor(this.base_cost * Math.pow(1.7, this.timesUpgraded));
  }
  
  buy(): void {
    this.timesUpgraded++;
    this.setAmount();
    this.setCost();
  }

  apply(): void {
    const totalPercentage = 1.0 + this.amount / 100;
    console.log(`Applying ${this.name} upgrade with total percentage: ${totalPercentage}`);
    switch (this.type) {
      case upgradeType.workerSpeed:
        vars.ant.workerSpeedMult = totalPercentage;
        break;
            case upgradeType.soldierSpeed:
        vars.ant.soldierSpeedMult = totalPercentage;
        break;
            case upgradeType.soldierDamage:
        vars.ant.soldierAttack = defaultVars.ant.soldierAttack * totalPercentage;
        break;
            case upgradeType.carryingCapacity:
        vars.ant.workerCarryingCapacity = defaultVars.ant.workerCarryingCapacity * totalPercentage;
        vars.ant.soldierCarryingCapacity = defaultVars.ant.soldierCarryingCapacity * totalPercentage;
        break;
            case upgradeType.foodSpawnRate:
        vars.food.entitySpawnFactor = defaultVars.food.entitySpawnFactor * totalPercentage;
        break;
            case upgradeType.hpRecoveryRate:
        vars.ant.workerHpRecoveryRate = defaultVars.ant.workerHpRecoveryRate * totalPercentage;
        vars.ant.soldierHpRecoveryRate = defaultVars.ant.soldierHpRecoveryRate * totalPercentage;
        vars.ant.queenHpRecoveryRate = defaultVars.ant.queenHpRecoveryRate * totalPercentage;
        break;
    }
  }
}



export class Cosmetic implements Perk{
  name: string;
  cost: number;
  description: string;
  isPurchased: boolean;
  amount: number = 0;

  constructor(perkData: PerkData){
    if (perkData.isUpgrade || ! perkData.isPurchased){
      throw new Error("Invalid perk data");
    }
    this.name = perkData.name;
    this.cost = 50;
    this.description = "new cosmetic";
    this.isPurchased = perkData.isPurchased;
  }

  getName(): string {
    return this.name;
  }

  getCost(): number {
    return this.cost;
  }

  getDescription(): string {
    return this.description;
  }


  apply(): void {
    // Cosmetic perks don't have any effect
  }

  toData(): PerkData{
    return {
      name: this.name,
      type: null,
      timesUpgraded: null,
      isUpgrade: false,
      isPurchased: this.isPurchased,
    }
  }
}

export const reapplyPerks = (perks: Perk[]) => {
  perks.forEach((perk) => {
    if (perk instanceof Upgrade) {
      perk.apply();
    }
  });
  
}
export default Perk;