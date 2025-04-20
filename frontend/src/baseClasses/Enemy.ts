import { v4 } from "uuid";
import { useColonyStore } from "../contexts/colonyStore";
import { usePreloadedImagesStore } from "../contexts/preloadImages";
import { useSettingsStore } from "../contexts/settingsStore";
import { findClosestAnt, setOneAntOnEnemy } from "../gameLogic/antHelperFunctions";
import { calculateDistance } from "../gameLogic/entityHelperFunctions";
import { Ant } from "./Ant";
import { InteractiveElement } from "./Models";

export enum EnemyTypeEnum {
  Maggot = "maggot",
  Mantis = "mantis",
  Beetle = "beetle",
}

// Define the EnemyData type
export type EnemyData = {
  id: string;
  type: EnemyTypeEnum; // Type of the enemy (e.g., maggot, mantis, beetle)
  coords: { x: number; y: number }; // Coordinates of the enemy
  hp: number; // Health points of the enemy
  speed: number; // Speed of the enemy
};

// Define the Enemy class
export class Enemy implements InteractiveElement{
  id: string;
  type: EnemyTypeEnum; // Type of the enemy (e.g., maggot, mantis, beetle)
  coords: { x: number; y: number }; // Coordinates of the enemy
  objective: Ant | null; // Target ant (not in EnemyData)
  movingTo: { x: number; y: number } = { x: 0, y: 0 }; // Frontend-only field
  speed: number; // Speed of the enemy
  frame: number = 0; // Frontend-only field
  spriteFrameTimer: number = 0; // Frontend-only field
  angle: number = 0; // Frontend-only field
  isAttacking: boolean = false; // Frontend-only field
  hp: number; // Health points of the enemy
  movementInitialized: boolean = false; // Frontend-only field
  attackDelay: number = 0; // Frontend-only field
  isDead: boolean = false; // Frontend-only field
  clickable: boolean = true;

  static resetObjectiveRange = 100;


  constructor(
    type: EnemyTypeEnum,
    coords: { x: number; y: number },
    speed: number,
    hp: number,
    id: string = v4(),
  ) {
    this.id = id;
    this.type = type;
    this.coords = coords;
    this.objective = null;
    this.speed = speed;
    this.hp = hp;
  }

  // Convert Enemy to EnemyData
  static toData(enemy: Enemy): EnemyData {
    return {
      id: enemy.id,
      type: enemy.type,
      coords: enemy.coords,
      hp: enemy.hp,
      speed: enemy.speed,
    };
  }

  // Convert EnemyData to Enemy
  static fromData(data: EnemyData): Enemy {
    const enemy = new Enemy(data.type, data.coords, data.speed, data.hp, data.id);
    console.log("Enemy created from data:", enemy);
    return enemy;
  }

  discreteUpdate() {
    this.setObjective();
    this.setMovingTo();
    if (!this.movementInitialized) this.movementInitialized = true;
  }

  onClick(event: React.MouseEvent<HTMLCanvasElement>) {
    event.stopPropagation(); // Prevent event from bubbling up
    setOneAntOnEnemy(this);
  }

  attack() {
    this.isAttacking = false;
    this.attackDelay = EnemyTypeInfo[this.type].attackDelay;
    if (this.objective) {
      const randomOffset = Math.random() * 0.4 + 0.8;
      if (this.objective.receiveAttack(EnemyTypeInfo[this.type].attackDamage * randomOffset)){
        this.objective = null; // Reset objective if the ant is dead
        this.movementInitialized = false; // Reset movement initialization
      }
    }
  }

  receiveAttack(damage: number): boolean {
    this.hp -= damage; // Decrease HP by the damage amount
    if (this.hp <= 0) {
      this.die();
      return true; // Ant is dead
    } else { return false; }
  }

  die(){
    const { enemies, updateColony } = useColonyStore.getState();
    updateColony({ enemies: enemies.filter((enemy) => enemy.id !== this.id) });
    this.isDead = true; 
  }

  setObjective() {
    if ((
      (!this.objective || this.objective.isDead 
        || calculateDistance(this.coords, this.objective.coords) > Enemy.resetObjectiveRange
      ) && this.attackDelay <= 0
    ) || (this.movementInitialized == false)) {
      this.objective = findClosestAnt(this.coords);
    }
  }

  setMovingTo() {
    if (this.objective) {
      this.movingTo.x = this.objective.coords.x;
      this.movingTo.y = this.objective.coords.y;
    }
  }

  continuousUpdate(delta: number) {
    if (!this.movementInitialized) { return; }

    const dx = this.movingTo.x - this.coords.x;
    const dy = this.movingTo.y - this.coords.y;
    this.angle = Math.atan2(dy, dx) + Math.PI / 2; // Angle starting from the top
    const distance = Math.sqrt(dx * dx + dy * dy); // Calculate distance to the target

    this.isAttacking =
      distance <= EnemyTypeInfo[this.type].attackRange &&
      this.attackDelay <= 0; // Check if within attack range

    if (!this.isAttacking) {
      this.coords.x += (dx / distance) * this.speed * delta; // Move towards the target
      this.coords.y += (dy / distance) * this.speed * delta; // Move towards the target
    }

    if (this.attackDelay > 0) {
      this.attackDelay = Math.max(0, this.attackDelay - delta); // Decrease attack delay
    }

    this.updateSpriteFrame(delta); // Update the sprite frame based on the task
  }

  updateSpriteFrame(delta: number) {
    const updateInterval = 3 / this.speed; // Adjust the update interval based on speed
    const totalFrames = this.isAttacking
      ? EnemyTypeInfo[this.type].attackCols
      : EnemyTypeInfo[this.type].moveCols; // Get the number of frames based on the task

    this.spriteFrameTimer += delta;
    if (this.spriteFrameTimer >= updateInterval) {
      if (this.isAttacking && this.frame == totalFrames - 1) {
        this.attack();
      }
      this.frame = (this.frame + 1) % totalFrames; // Cycle through frames
      this.spriteFrameTimer -= updateInterval;
    }
  }

  drawHpBar(ctx: CanvasRenderingContext2D) {
    const hpBarWidth = EnemyTypeInfo[this.type].defaultHp / 3;
    const hpBarHeight = 4;
    const hpBarYOffset =  - EnemyTypeInfo[this.type].hpBarYOffset; // Y offset for the HP bar
    const hpPercent = this.hp / EnemyTypeInfo[this.type].defaultHp; // Calculate the percentage of HP remaining

    ctx.fillStyle = "black"; // Background color
    ctx.fillRect(-hpBarWidth/2,hpBarYOffset, hpBarWidth, hpBarHeight); // Draw the background bar

    ctx.fillStyle = "red"; // Foreground color
    ctx.fillRect(-hpBarWidth/2, hpBarYOffset, hpBarWidth * hpPercent, hpBarHeight); // Draw the foreground bar
  }



  getBounds() {
    const { canvasWidth, canvasHeight } = useSettingsStore.getState(); // Get canvas dimensions
    const size = {
      width: EnemyTypeInfo[this.type].defaultSize.width,
      height: EnemyTypeInfo[this.type].defaultSize.height,
    };

    const posX = this.coords.x + canvasWidth / 2;
    const posY = this.coords.y + canvasHeight / 2;

    const left = posX - size.width / 2;
    const top = posY - size.height / 2;

    return { left: left, top: top, width: size.width, height: size.height, };
  }

  setAngle() {
    const dx = this.movingTo.x - this.coords.x;
    const dy = this.movingTo.y - this.coords.y;
    this.angle = Math.atan2(dy, dx) + Math.PI / 2; // Arc tangent to get the angle in radians
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { getImage } = usePreloadedImagesStore.getState();
    const img = getImage(this.type);
    if (!img) {
      console.error(`Image for enemy type ${this.type} not loaded`);
      return;
    }
    const totalSpriteWidth = img.width;
    const totalSpriteHeight = img.height;
    const spriteWidth = totalSpriteWidth / EnemyTypeInfo[this.type].totalCols;
    const spriteHeight = totalSpriteHeight / EnemyTypeInfo[this.type].totalRows;
    const col = this.isAttacking ? EnemyTypeInfo[this.type].moveCols + this.frame : this.frame;
    const row = this.getRowBasedOnAngle();
    const bounds = this.getBounds();

    ctx.save();
    ctx.translate(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    this.drawHpBar(ctx);
    ctx.drawImage( img, col * spriteWidth, row * spriteHeight, spriteWidth, spriteHeight,
      -bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
    ctx.restore();
  }

  getRowBasedOnAngle() {
    //rows are going down, right, left and up
    const angleMinus45Degrees = this.angle - Math.PI / 4;
    const normalizedAngle = (angleMinus45Degrees + 2 * Math.PI) % (2 * Math.PI); // Normalize the angle to be between 0 and 2π
    const quadrant = Math.floor(normalizedAngle / (Math.PI / 2)); // Divide by 90 degrees to get the row
    //the new quadrants start from 45 degrees above x 
    // rotating all points 45 counterclockwise is the same as rotating the new quadrants 45 degrees clockwise in relation to the old quadrants
    // so they correspond to right, down, left and up
    switch (quadrant % 4) {
      case 0: return 1; // Right
      case 1: return 0; // Down
      case 2: return 2; // Left
      case 3: return 3; // Up
    } return 0;
  }
}

const getRandomType = (): EnemyTypeEnum => {
  const randomValue = Math.random();
  if (randomValue < 0.45) {
    return EnemyTypeEnum.Mantis;
  } else if (randomValue < 0.9) {
    return EnemyTypeEnum.Beetle;
  }
  return EnemyTypeEnum.Maggot;
}

export const createEnemy = (
  type: EnemyTypeEnum = getRandomType()
): Enemy => {
  const { canvasWidth, canvasHeight } = useSettingsStore.getState();
  const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  let x = 0, y = 0;
  switch (edge) {
    case 0: // Top edge
      x = Math.random() * canvasWidth - canvasWidth / 2;
      y = -canvasHeight / 2 - 30; // Move further outside the top edge
      break;
    case 1: // Right edge
      x = canvasWidth / 2 + 30; // Move further outside the right edge
      y = Math.random() * canvasHeight - canvasHeight / 2;
      break;
    case 2: // Bottom edge
      x = Math.random() * canvasWidth - canvasWidth / 2;
      y = canvasHeight / 2 + 30; // Move further outside the bottom edge
      break;
    case 3: // Left edge
      x = -canvasWidth / 2 - 30; // Move further outside the left edge
      y = Math.random() * canvasHeight - canvasHeight / 2;
      break;
  }

  return new Enemy(
    type,
    { x, y },
    EnemyTypeInfo[type].defaultSpeed,
    EnemyTypeInfo[type].defaultHp
  );
};

export const EnemyTypeInfo: {
  [key in EnemyTypeEnum]: {
    speed: number;
    defaultSpeed: number;
    defaultSize: { width: number; height: number };
    defaultHp: number;
    totalCols: number;
    totalRows: number;
    moveCols: number;
    attackCols: number;
    isRanged: boolean;
    attackRange: number;
    attackDelay: number;
    attackDamage: number; // Added attack damage field
    hpBarYOffset: number; // Added hpBarYOffset
  };
} = {
  [EnemyTypeEnum.Maggot]: {
    speed: 5.5,
    defaultSpeed: 0.02,
    defaultSize: { width: 60, height: 60 },
    defaultHp: 60,
    totalCols: 11,
    totalRows: 4,
    moveCols: 4,
    attackCols: 7,
    isRanged: true,
    attackRange: 30,
    attackDelay: 1400,
    attackDamage: 30, // Added attack damage value
    hpBarYOffset: 20, // Added hpBarYOffset
  },
  [EnemyTypeEnum.Mantis]: {
    speed: 7,
    defaultSpeed: 0.04,
    defaultSize: { width: 60, height: 60 },
    defaultHp: 120,
    totalCols: 8,
    totalRows: 4,
    moveCols: 4,
    attackCols: 4,
    isRanged: false,
    attackRange: 40,
    attackDelay: 300,
    attackDamage: 25, // Added attack damage value
    hpBarYOffset: 29, // Added hpBarYOffset
  },
  [EnemyTypeEnum.Beetle]: {
    speed: 10,
    defaultSpeed: 0.05,
    defaultSize: { width: 60, height: 60 },
    defaultHp: 100,
    totalCols: 8,
    totalRows: 4,
    moveCols: 4,
    attackCols: 4,
    isRanged: false,
    attackRange: 40,
    attackDelay: 1000,
    attackDamage: 17, // Added attack damage value
    hpBarYOffset: 27, // Added hpBarYOffset
  },
};

