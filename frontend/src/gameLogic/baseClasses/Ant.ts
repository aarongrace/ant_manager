import { v4 } from "uuid";
import { useColonyStore } from "../../contexts/colonyStore";
import { vars } from "../../contexts/globalVariables"; // Updated to use env
import { usePreloadedImagesStore } from "../../contexts/preloadImages";
import { drawAttackArrow, drawForageArrow, drawPatrolCircle, startPatrol } from "../antHelperFunctions";
import { findEnemyByCondition } from "../enemyHelperFunctions";
import { Enemy } from "./Enemy";
import { Fruit } from "./Fruit";
import { GameMap } from "./Map";
import { EntityType, MapEntity } from "./MapEntity";
import { Bounds, InteractiveElement } from "./Models";

// Define the TaskEnum type
export enum TaskType {
  Idle = "idle",
  Forage = "forage",
  Patrol = "patrol",
  Attack = "attack",
}

export enum AntType {
  Queen = "queen",
  Worker = "worker",
  Soldier = "soldier",
}

export type CarryingData = {
  imgName: string; // Name of the image associated with the carried item
  amount: number; // Amount of the resource being carried
  col?: number; // Column of the grid (optional)
  row?: number; // Row of the grid (optional)
};

export type AntData = {
  id: string; // Unique identifier for the ant
  name: string; // Name of the ant
  age: number; // Age of the ant
  type: string; // Type of the ant (e.g., worker, soldier, queen)
  task: TaskType; // Current task of the ant
  hp: number; // Health points of the ant
  coords: { x: number; y: number }; // Absolute coordinates of the ant
  objective: string; // ID of the objective entity the ant is interacting with
  destination: string; // ID of the object the ant is heading to
  carrying: CarryingData | null; // Resource the ant is carrying
  carryingCapacity: number; // Maximum carrying capacity of the ant
  speed: number; // Speed of the ant
  sizeFactor: number; // Size factor of the ant
};

// Define the Ant class
export class Ant implements InteractiveElement{
  id: string;
  name: string;
  age: number;
  type: AntType;
  task: TaskType;
  coords: { x: number; y: number }; // Renamed from position to coords
  objective: string; // Renamed from target to objective
  destination: string;
  movingTo: { x: number; y: number } = { x: GameMap.center.x, y: GameMap.center.y }; // New field for frontend only
  anchorPoint: { x: number; y: number } = { x: GameMap.center.x, y: GameMap.center.y }; // New field for frontend only
  carriedEntity: MapEntity | null; // Updated to use MapEntity for frontend
  carryingCapacity: number; // Moved carryingCapacity above amountCarried
  speed: number; // Added speed field
  frame: number = 0; // Moved above spriteFrameTimer
  spriteFrameTimer: number = 0; // Timer for sprite frame animation
  angle: number = 0; // Direction the ant is facing (e.g., in degrees)
  isBusy: boolean = false; // New field: Indicates if the ant is currently busy
  sizeFactor: number = 1; // Added sizeFactor field
  movementInitialized: boolean = false; // New field: Indicates if movement has been initialized (frontend only)
  isDead: boolean = false; // New field: Indicates if the ant is dead
  hp: number; // New field: Health points
  isAttacking: boolean = false;
  patrolAnchorPointSet: boolean = false; // New field: Indicates if the patrol anchor point is set
  isSelected: boolean = false; // New field: Indicates if the ant is selected

  hoverable: boolean =true;
  isHovered: boolean = false;
  clickable: boolean = true; // New field: Indicates if the ant is clickable


  constructor(antData: AntData) {
    this.id = antData.id;
    this.name = antData.name;
    this.age = antData.age;
    this.type = antData.type as AntType;
    this.task = antData.task;
    this.coords = antData.coords; // Initialize coords field
    this.objective = antData.objective; // Initialize objective field
    this.destination = antData.destination;
    this.movingTo = { x: GameMap.center.x, y: GameMap.center.y }; // Initialize movingTo field
    this.anchorPoint = { x: GameMap.center.x, y: GameMap.center.y }; // Initialize anchorPoint field
    this.carriedEntity = this.convertCarryingToData(antData.carrying); // Initialize carrying field
    this.carryingCapacity = antData.carryingCapacity; // Initialize carryingCapacity field
    this.speed = antData.speed; // Initialize speed field
    this.frame = 0; // Default value for frame
    this.spriteFrameTimer = 0; // Default value for sprite frame timer
    this.angle = Math.random() * Math.PI * 2; // Default value for orientation
    this.sizeFactor = antData.sizeFactor; // Initialize sizeFactor field
    this.hp = antData.hp; // Initialize hp
  }

  convertCarryingToData(carryingData: CarryingData | null): MapEntity | null {
    if (carryingData) {
      if (carryingData.col !== undefined && carryingData.row !== undefined) {
        const fruit = new Fruit(
          { x: 0, y: 0 },
          carryingData.amount,
          carryingData.col,
          carryingData.row,
          1
        );
        fruit.size = vars.ui.carriedEntitySize; // Updated to use env
        return fruit;
      } else {
        return new MapEntity(
          v4(),
          EntityType.FoodResource,
          { x: 0, y: 0 },
          vars.ui.carriedEntitySize, // Updated to use env
          carryingData.amount,
          carryingData.imgName
        );
      }
    } else {
      return null; // Default value for carrying
    }
  }

  updateSpriteFrame(delta: number) {
    // Update the sprite frame based on the task and time elapsed
    var updateInterval;
    switch (this.type) {
      case AntType.Soldier:
        updateInterval = 150; // Soldier ants
        break;
      case AntType.Worker:
        updateInterval = 100; // Worker ants
        break;
      default:
        updateInterval = 150; // Default for other types
    }
    if (this.isBusy) {
      updateInterval *= 0.5;
    }

    if (this.task === TaskType.Idle) {
      updateInterval *= 2; // Slow down the animation when idle
    }

    this.spriteFrameTimer += delta;
    const lastFrame  = this.isAttacking ? AntTypeInfo[this.type].numOfAttackFrames - 1 : AntTypeInfo[this.type].numOfFrames - 1;

    if (this.spriteFrameTimer >= updateInterval) {
      if (this.isAttacking && this.frame === lastFrame) {
        this.attack();
      }

      this.frame = (this.frame + 1) % (lastFrame + 1); // Cycle through 3 frames
      this.spriteFrameTimer -= updateInterval;
    }
  }

  toAntData(): AntData {
    var carryingData: CarryingData | null = null;
    if (this.carriedEntity instanceof Fruit) {
      carryingData = {
        imgName: this.carriedEntity.imgName,
        amount: this.carriedEntity.amount,
        col: this.carriedEntity.col,
        row: this.carriedEntity.row,
      };
    } else if (this.carriedEntity instanceof MapEntity) {
      carryingData = {
        imgName: this.carriedEntity.imgName,
        amount: this.carriedEntity.amount,
      };
    } else {
      carryingData = null; // Default value for carrying
    }
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      type: this.type,
      task: this.task,
      coords: this.coords, // Include coords field
      objective: this.objective, // Include objective field
      destination: this.destination,
      carrying: carryingData, // Include carrying field
      carryingCapacity: this.carryingCapacity, // Include carryingCapacity field
      speed: this.speed, // Include speed field
      sizeFactor: this.sizeFactor, // Include sizeFactor field
      hp: this.hp, // Include hp field
    };
  }

  randomlyRotate() {
    this.angle = Math.random() * Math.PI * 2;
  }

  setAngle() {
    const dx = this.movingTo.x - this.coords.x;
    const dy = this.movingTo.y - this.coords.y;
    this.angle = Math.atan2(dy, dx) + Math.PI / 2; // Arc tangent to get the angle in radians
  }

  receiveAttack(damage: number): boolean {
    this.hp -= damage; // Decrease HP by the damage amount
    if (this.hp <= 0) {
      this.die();
      return true; // Ant is dead
    } else {
      return false;
    }
  }

  onClick(event: React.MouseEvent<HTMLCanvasElement>) {
    this.isSelected = !this.isSelected; // Toggle selection state
    console.log(`Ant clicked: ${this.name}, selected: ${this.isSelected}`);
  }

  setPatrolAnchor(coords: { x: number, y: number }) {
    this.patrolAnchorPointSet = true;
    this.anchorPoint.x = coords.x;
    this.anchorPoint.y = coords.y;
    console.log("Patrol anchor point set to:", this.anchorPoint);
    startPatrol(this);
  }

  setEnemy(enemy: Enemy | null) {
    if (!enemy) {
      startPatrol(this);
      return;
    }
    this.task = TaskType.Attack; // Set the task to attack
    this.objective = enemy.id; // Set the objective to the enemy ID
    this.destination = enemy.id; // Set the destination to the enemy ID
    this.movingTo.x = enemy.coords.x; // Set the movingTo coordinates to the enemy's coordinates
    this.movingTo.y = enemy.coords.y; // Set the movingTo coordinates to the enemy's coordinates
  }

  attack() {
    const enemy = findEnemyByCondition((enemy) => enemy.id === this.objective);
    if (enemy) {
      this.isAttacking = false; // Reset the attacking state
      const damage = this.type === AntType.Soldier ? vars.ant.soldierAttack
        : this.type === AntType.Worker ? vars.ant.workerAttack : 0
      enemy.receiveAttack(damage);
    }
  }

  getBounds(): Bounds{
    const viewportTopLeft = GameMap.getViewportTopLeft();
    const width = AntTypeInfo[this.type].size * this.sizeFactor; // Updated to use env
    const height = AntTypeInfo[this.type].size * this.sizeFactor; // Updated to use env
    return {
      left: this.coords.x - viewportTopLeft.x - width / 2,
      top: this.coords.y - viewportTopLeft.y - height / 2,
      width: width,
      height: height,
    }
  }

  die() {
    const { ants, updateColony } = useColonyStore.getState();
    const newAnts = ants.filter((ant) => ant.id !== this.id);
    updateColony({ ants: newAnts });
    this.isDead = true; // Mark the ant as dead
  }

  // ---------- Drawing Methods ----------

  draw(ctx: CanvasRenderingContext2D) {
    const { x: viewportLeft, y: viewportTop } = GameMap.getViewportTopLeft();
    const viewportX = this.coords.x - viewportLeft;
    const viewportY = this.coords.y - viewportTop;

    ctx.save();
    ctx.translate(viewportX, viewportY);
    if (this.hp < AntTypeInfo[this.type].defaultHp) { // has to be done before rotation
      this.drawHpBar(ctx);
    };

    if (this.task === TaskType.Patrol && (vars.highlightedTask === TaskType.Patrol || vars.showPatrolCircle)) {
      drawPatrolCircle(ctx, this);
    } else if (this.task === TaskType.Attack && (vars.highlightedTask === TaskType.Attack || vars.showAttackArrow)) {
      drawAttackArrow(ctx, this);
    } else if (this.task === TaskType.Forage && (vars.highlightedTask === TaskType.Forage || vars.showForageArrow)) {
      drawForageArrow(ctx, this);
    }


    ctx.rotate(this.angle);
    this.drawSprite(ctx);
    this.drawCarriedEntity(ctx);

    if (this.isSelected) { this.drawSelectedCircle(ctx); }
    ctx.restore();
  }

  drawSprite(ctx: CanvasRenderingContext2D) {
    const bounds = this.getBounds();
    const { width, height } = bounds;
    const { getImage } = usePreloadedImagesStore.getState();
    if (this.type === AntType.Queen) {
      const antSprites = this.isHovered? getImage("ant_sprites_hovered"): getImage("ant_sprites");
      if (!antSprites) {
        console.error("Image not found: ant_sprites");
        return;
      }
      const spriteY = 0;
      const spriteCol = 2;
      const spriteWidth = 39;
      const spriteWidthIncludingPadding = 66;
      const spriteHeight = 47;
      const spriteX = spriteWidthIncludingPadding * (spriteCol * 3 + this.frame);
      ctx.drawImage( antSprites, spriteX, spriteY, spriteWidth, spriteHeight,
        -width / 2, -height / 2, width, height);
    } else {
      const imgName = this.isHovered ? this.type + "_sprites_hovered": this.type + "_sprites";
      const img = getImage(imgName);
      if (!img) {
        console.error("Image not found:", imgName);
        return;
      }
      const useAttackSprite = this.isAttacking && this.type === AntType.Soldier;
      const spriteWidth = img.width / AntTypeInfo[this.type].numOfSpriteFrames;
      const spriteHeight = img.height;
      const spriteX = useAttackSprite ? spriteWidth * (5 + this.frame) : spriteWidth * this.frame;
      const spriteY = 0;
      ctx.drawImage(img, spriteX, spriteY, spriteWidth, spriteHeight,
        -width / 2, -height / 2, width, height)
    }
  }

  drawHpBar(ctx: CanvasRenderingContext2D) {
    const htBarWidth = AntTypeInfo[this.type].defaultHp / 4;
    const hpBarHeight = 4;
    const hpBarYOffset =
      -this.sizeFactor * AntTypeInfo[this.type].hpBarYOffset; // Y offset for the HP bar
    const hpPercent = this.hp / AntTypeInfo[this.type].defaultHp; // Calculate the percentage of HP remaining

    ctx.fillStyle = "black"; // Background color
    ctx.fillRect(-htBarWidth / 2, hpBarYOffset, htBarWidth, hpBarHeight); // Draw the background bar

    ctx.fillStyle = "green"; // Foreground color
    ctx.fillRect(
      -htBarWidth / 2,
      hpBarYOffset,
      htBarWidth * hpPercent,
      hpBarHeight
    ); // Draw the foreground bar
  }
  drawCarriedEntity(ctx: CanvasRenderingContext2D) {
    if (this.carriedEntity) {
      const carriedEntity = this.carriedEntity;
      var carriedScale = carriedEntity.amount / vars.ant.workerCarryingCapacity; // Updated to use env
      if (carriedEntity.type === EntityType.ChitinSource) {
        carriedScale *= 8;
      }
      const yOffset = this.type === AntType.Soldier ? -26: -14 - carriedScale * 3;
      const carriedEntityBounds: Bounds = {
        left: -carriedEntity.size.width / 2 * carriedScale,
        top: -carriedEntity.size.height / 2 * carriedScale + yOffset,
        width: carriedEntity.size.width * carriedScale,
        height: carriedEntity.size.height * carriedScale,
      };
      carriedEntity.draw(ctx, carriedEntityBounds);
    }
  }

  drawSelectedCircle(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      0,0,
      this.type === AntType.Worker ? 20 : 30,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // Color of the selection circle
    ctx.lineWidth = 2; // Width of the selection circle
    ctx.stroke();
    ctx.restore();
  }

}

export const AntTypeInfo: {
  [key in AntType]: {
    speed: number;
    carryingCapacity: number;
    defaultHp: number;
    hpBarYOffset: number;
    cost: number;
    attackRange: number;
    size: number; // Added size field
    numOfFrames: number; // Added numOfFrames field
    numOfAttackFrames: number; // Added numOfAttackFrames field
    numOfSpriteFrames: number; // Added numOfSpriteFrames field
  };
} = {
  [AntType.Queen]: {
    speed: vars.ant.queenBaseSpeed, // Updated to use env
    carryingCapacity: 0,
    defaultHp: 200,
    hpBarYOffset: 30,
    cost: 1000,
    attackRange: 0,
    size: 40, // Added size value for Queen
    numOfFrames: 3, // Added numOfFrames value for Queen
    numOfAttackFrames: 3, // Added numOfAttackFrames value for Queen
    numOfSpriteFrames: 3, // Added numOfSpriteFrames value for Queen
  },
  [AntType.Worker]: {
    speed: vars.ant.workerBaseSpeed, // Updated to use env
    carryingCapacity: vars.ant.workerCarryingCapacity, // Updated to use env
    defaultHp: 40,
    hpBarYOffset: 17,
    cost: 20,
    attackRange: 25,
    size: 25, // Added size value for Worker
    numOfFrames: 5, // Added numOfFrames value for Worker
    numOfAttackFrames: 5, // Added numOfAttackFrames value for Worker
    numOfSpriteFrames: 5, // Added numOfSpriteFrames value for Worker
  },
  [AntType.Soldier]: {
    speed: vars.ant.soldierBaseSpeed, // Updated to use env
    carryingCapacity: vars.ant.soldierCarryingCapacity, // Updated to use env
    defaultHp: 160,
    hpBarYOffset: 21,
    cost: 40,
    attackRange: 80,
    size: 60, // Added size value for Soldier
    numOfFrames: 5, // Added numOfFrames value for Soldier
    numOfAttackFrames: 6, // Added numOfAttackFrames value for Soldier
    numOfSpriteFrames: 11, // Added numOfSpriteFrames value for Soldier
  },
};