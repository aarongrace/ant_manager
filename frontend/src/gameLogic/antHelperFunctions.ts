import { v4 } from "uuid";
import { useColonyStore } from "../contexts/colonyStore";
import { vars } from "../contexts/globalVariables"; // Use env for constants
import { Ant, AntData, AntType, AntTypeInfo, TaskType } from "./baseClasses/Ant";
import { antNames } from "./baseClasses/antNames";
import { Enemy } from "./baseClasses/Enemy";
import { GameMap } from "./baseClasses/Map";
import { EntityType, MapEntity } from "./baseClasses/MapEntity";
import { findEnemyByCondition } from "./enemyHelperFunctions";
import { findMapEntity, getNestEntranceCoords, getRandomCoordsInViewport } from "./entityHelperFunctions";

export const findClosestAnt = (coords: { x: number, y: number }): Ant | null => {
    const { ants } = useColonyStore.getState();
    let closestAnt: Ant | null = null;
    let minDistance = Infinity;

    for (let ant of ants) {
        const dx = ant.coords.x - coords.x;
        const dy = ant.coords.y - coords.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
            minDistance = distance;
            closestAnt = ant;
        }
    }
    return closestAnt;
};

export const setOneAntToTask = (task: TaskType): void => {
    const { ants } = useColonyStore.getState();
    const antsExceptForQueen = ants.filter(ant => ant.type !== AntType.Queen);
    const suitableType = task === TaskType.Forage ? AntType.Worker : AntType.Soldier;

    const findAntAndSetTask = (condition: (ant: Ant) => boolean) => {
        for (let ant of antsExceptForQueen) {
            if (ant.task !== task && condition(ant)) {
                ant.task = task;
                return;
            }
        }
    };
    switch (task) {
        case TaskType.Idle:
        case TaskType.Forage:
            findAntAndSetTask((ant) => ant.type === AntType.Worker);
            findAntAndSetTask((ant) => ant.type === AntType.Soldier);
            break;
        case TaskType.Patrol:
            findAntAndSetTask((ant) => ant.type === AntType.Soldier && ant.task !== TaskType.Attack);
            break;
        case TaskType.Attack:
            const enemy = findEnemyByCondition((enemy) => true);
            if (enemy) {
                setOneAntOnEnemy(enemy);
            }
    }
};

export const setOneAntOnEnemy = (enemy: Enemy): void => {
    const { ants } = useColonyStore.getState();
    const antsExceptForQueen = ants.filter(ant => ant.type !== AntType.Queen);
    for (let ant of antsExceptForQueen) {
        if (ant.task !== TaskType.Attack && ant.type === AntType.Soldier) {
            ant.setEnemy(enemy);
            return;
        }
    }
    for (let ant of antsExceptForQueen) {
        if (ant.task !== TaskType.Attack && ant.type === AntType.Worker) {
            ant.setEnemy(enemy);
            return;
        }
    }
};

export const findAntByCondition = (condition: (ant: Ant) => boolean): Ant | null => {
    const { ants } = useColonyStore.getState();
    for (let ant of ants) {
        if (condition(ant)) {
            return ant;
        }
    }
    return null;
};

export const findAntByTaskAndOrObjective = (task: TaskType, objectiveId: string = ""): Ant | null => {
    const { ants } = useColonyStore.getState();
    for (let ant of ants) {
        if (ant.task === task && ant.type !== AntType.Queen && ant.objective !== objectiveId) {
            console.log("Found ant with task:", task);
            return ant;
        }
    }
    return null;
};

export const setAntObjective = (ant: Ant, objective: MapEntity | undefined): boolean => {
    if (!objective) {
        return false;
    }
    ant.objective = objective.id;
    setDestination(ant, objective);
    switch (objective.type) {
        case EntityType.FoodResource:
            ant.task = TaskType.Forage;
            break;
    }
    ant.isBusy = false;
    return true;
};

export const setDestination = (ant: Ant, destination: MapEntity | undefined) => {
    if (!destination) {
        return;
    }
    ant.destination = destination.id;

    const offsetFactor = destination.type === EntityType.Gateway ? 50 : 20;

    // Calculate the angle between the ant and the destination
    const dx = destination.coords.x - ant.coords.x;
    const dy = destination.coords.y - ant.coords.y;
    const angle = Math.atan2(dy, dx); // Angle in radians

    const getBiasedRandomCoords = (coord: number, isX: boolean) => {
        const randomOffset = Math.random() - 0.5;
        const bias = isX ? Math.cos(angle) : Math.sin(angle);
        const biasedOffset = (randomOffset - bias * 1.1) * offsetFactor;
        return Math.min(
            GameMap.mapWidth - vars.ui.edgeMargin,
            Math.max(vars.ui.edgeMargin, coord + biasedOffset)
        );
    };

    ant.movingTo.x = getBiasedRandomCoords(destination.coords.x, true);
    ant.movingTo.y = getBiasedRandomCoords(destination.coords.y, false);
};

export const findAntByTargetEntity = (entity: MapEntity): Ant | null => {
    const { ants } = useColonyStore.getState();
    for (let ant of ants) {
        if (ant.objective === entity.id) {
            return ant;
        }
    }
    return null;
};

export const setAntToIdle = (ant: Ant) => {
    ant.task = TaskType.Idle;
    ant.objective = "";
    ant.destination = "";
    ant.isBusy = false;

    if (ant.type === AntType.Queen) {
        const nestCoords = getNestEntranceCoords();
        ant.anchorPoint.x = nestCoords.x + (Math.random() - 1) * vars.ant.idleRange;
        ant.anchorPoint.y = nestCoords.y + (Math.random() - 1) * vars.ant.idleRange;
    } else {
        ant.anchorPoint.x = ant.coords.x + (Math.random() - 1) * vars.ant.idleRange;
        ant.anchorPoint.y = ant.coords.y + (Math.random() - 1) * vars.ant.idleRange;
    }
    findIdleCoords(ant);
};

export const findIdleCoords = (ant: Ant) => {
    ant.movingTo.x = ant.anchorPoint.x + (Math.random() - 1) * 0.1 * vars.ui.canvasWidth;
    ant.movingTo.y = ant.anchorPoint.y + (Math.random() - 1) * 0.1 * vars.ui.canvasHeight;
};

export const hasArrived = (ant: Ant) => {
    const dx = ant.movingTo.x - ant.coords.x;
    const dy = ant.movingTo.y - ant.coords.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const arrivalThreshold = ant.task === TaskType.Attack ? AntTypeInfo[ant.type].attackRange :  5; // Adjusted for absolute coordinates
    return distance < arrivalThreshold;
};

export const startPatrol = (ant: Ant) => {
    ant.task = TaskType.Patrol;
    ant.objective = "";
    ant.destination = "";
    findNewPatrolCoords(ant);
}

export const findNewPatrolCoords = (ant: Ant) => {
    if (ant.patrolAnchorPointSet){
        ant.movingTo.x = ant.anchorPoint.x + (Math.random()-1) * vars.ant.patrolRange/2;
        ant.movingTo.y = ant.anchorPoint.y + (Math.random()-1) * vars.ant.patrolRange/2;
    } else {
        ant.movingTo = getRandomCoordsInViewport();
    }
}

export const moveWhileBusy = (ant: Ant) => {
    // this function moves ant slightly towards the objective while busy
    const objective = findMapEntity(ant.objective);
    if (objective) {
        var dx = objective.coords.x - ant.coords.x;
        var dy = objective.coords.y - ant.coords.y;
        const randomFactor = Math.random();
        if (randomFactor < 0.3) {
            ant.movingTo.x += dx * 2;
            ant.movingTo.y += dy;
        } else if (randomFactor < 0.6) {
            ant.movingTo.x += dx;
            ant.movingTo.y += dy * 2;
        }
    }
    ant.setAngle();
}


export const reignInCoords = (coords: { x: number, y: number }) => {
    coords.x = Math.max(
        vars.ui.edgeMargin,
        Math.min(GameMap.mapWidth - vars.ui.edgeMargin, coords.x)
    );
    coords.y = Math.max(
        vars.ui.edgeMargin,
        Math.min(
            GameMap.mapHeight - vars.ui.edgeMargin,
            coords.y
        )
    );
}

// Helper method to get a random AntType
export const getRandomAntType = (): AntType => {
  const antTypes = Object.values(AntType).filter(
    (antType) => antType !== AntType.Queen
  ) as AntType[];
  return antTypes[Math.floor(Math.random() * antTypes.length)];
};


export const findOrRemoveAntForFoodSource = (entity: MapEntity, shouldRemove: boolean) => {
    const { ants } = useColonyStore.getState();
    if (!shouldRemove) {
        // send ant to food source if left click
        var ant = findAntByTaskAndOrObjective(TaskType.Idle, entity.id);
        if (!ant) {
            ant = findAntByTaskAndOrObjective(TaskType.Forage, entity.id);
        }
        if (!ant) { // find any available ant
            ant = ants.filter(ant => ant.objective !== entity.id && ant.type !== AntType.Queen)[0];
        }
        if (ant) {
            setAntObjective(ant, entity);
            console.log(`Assigned ${ant.id} to food source ${entity.id}`);
        } else {
            console.log("No available ants to assign to food source");
        }
    } else {
        // remove food source if right click
        const ant = findAntByTargetEntity(entity);
        if (ant) {
            setAntToIdle(ant);
        }
    }
}

export const setAntToOptimalTask = (ant: Ant) => {
    switch (ant.type) {
        case AntType.Queen:
            ant.task = TaskType.Idle;
            break;
        case AntType.Worker:
            ant.task = TaskType.Forage;
            break;
        case AntType.Soldier:
            ant.task = TaskType.Patrol;
            break;
    }
}

export const drawPatrolCircle = (ctx: CanvasRenderingContext2D, ant: Ant) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, vars.ant.patrolRange, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(135, 235, 255, 0.7)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
}

export const drawAttackArrow = (ctx: CanvasRenderingContext2D, ant: Ant) => {
    const enemy = findEnemyByCondition((enemy) => enemy.id === ant.objective);
    if (!enemy) {
        return;
    }
    drawArrow(ctx, ant.coords, enemy.coords, "rgba(236, 4, 4, 0.7)");
}

export const drawForageArrow = (ctx: CanvasRenderingContext2D, ant: Ant) => {
    console.log("Drawing forage arrow");
    const entity = findMapEntity(ant.destination);
    if (!entity) {
        return;
    }
    drawArrow(ctx, ant.coords, entity.coords, "rgba(94, 255, 94, 0.7)");
}
//add debugging by printing the coords for a unique ant
const drawArrow = (ctx: CanvasRenderingContext2D, from: { x: number, y: number }, to: { x: number, y: number }, color: string) => {
    const distance = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
    if (distance < 20){
        return;
    }
    // const headLength = 10;
    const offset = 13;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    // console.log("Angle for arrow:", angle);

    const startX = offset * Math.cos(angle);
    const startY = offset * Math.sin(angle);   
    const endX = to.x - from.x   - offset * Math.cos(angle);
    const endY = to.y - from.y - offset * Math.sin(angle);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}



export const checkIfAtCapacity = (ant: Ant) => {
    if (!ant.carriedEntity) {
        return false;
    } else if (ant.carriedEntity.type === EntityType.FoodResource) {
        return ant.carriedEntity.amount >= ant.carryingCapacity;
    } else if (ant.carriedEntity.type === EntityType.ChitinSource) {
        return ant.carriedEntity.amount >= ant.carryingCapacity/5;
    }
    return false;
}
 // Method to create a new Ant object
export function makeNewAnt(type = getRandomAntType()): Ant {
    const sizeFactor = Math.random() * 0.15 + 0.925; // Random sizeFactor between 0.95 and 1.05
    const speed =
      (type === AntType.Soldier
        ? vars.ant.soldierBaseSpeed
        : vars.ant.workerBaseSpeed) *
      (sizeFactor * sizeFactor);
    const carryingCapacity = Math.floor(
      (type === AntType.Soldier
        ? vars.ant.soldierCarryingCapacity
        : vars.ant.workerCarryingCapacity) *
        (Math.random() / 3 + 0.833)
    );
    const hp = AntTypeInfo[type].defaultHp;

    const { x: nestX, y: nestY } = getNestEntranceCoords();

    const antData: AntData = {
      id: v4(),
      name: antNames[Math.floor(Math.random() * antNames.length)],
      age: 0,
      type: type,
      task: type === AntType.Soldier ? TaskType.Patrol : TaskType.Forage,
      coords: {
        x: (Math.random() - 1) * 100 + nestX,
        y: (Math.random() - 1) * 100 + nestY,
      }, // Absolute coordinates
      objective: "", // Default value for objective
      destination: "",
      carrying: null, // Default value for carrying
      carryingCapacity: carryingCapacity, // Default value for carryingCapacity
      speed: speed, // Default value for speed
      sizeFactor: sizeFactor, // Random sizeFactor between 0.95 and 1.05
      hp: hp, // Default value for hp
    };
    return new Ant(antData);
  }

export const recreateQueen = (): Ant => {
  const antData: AntData = {
    id: v4(), // Generate a unique ID
    name: "Queenie", // Name of the queen
    age: 2, // Age of the queen
    type: AntType.Queen, // Type is queen
    task: TaskType.Idle, // Default task is idle
    coords: GameMap.getCoordsCloseToCenter(50), // Absolute coordinates
    objective: "", // No objective initially
    destination: "", // No destination initially
    carrying: null, // Default value for carrying
    carryingCapacity: 0, // Queens do not carry resources
    speed: vars.ant.queenBaseSpeed, // Updated to use env
    sizeFactor: 1.0, // Default sizeFactor for the queen
    hp: AntTypeInfo[AntType.Queen].defaultHp, // Default hp for the queen
  };
  return new Ant(antData);
};

export const convertAnts = (ants: Ant[]): AntData[] => {
  return ants.map((ant) => ant.toAntData());
};

export const convertAntData = (antData: AntData[]): Ant[] => {
  if (!antData) {
    return [];
  }
  return antData.map((data) => new Ant(data));
};
