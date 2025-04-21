import { Ant, AntType, AntTypeInfo, TaskType } from "../baseClasses/Ant";
import { Enemy } from "../baseClasses/Enemy";
import { EntityType, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { vals } from "../contexts/globalVars"; // Use env for constants
import { findEnemyByCondition } from "./enemyHelperFunctions";
import { findMapEntity, getNestEntranceCoords, getRandomCoords } from "./entityHelperFunctions";

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

export const setAntObjective = (ant: Ant, objective: MapEntity | undefined) => {
    if (!objective) {
        return;
    }
    ant.objective = objective.id;
    setDestination(ant, objective);
    switch (objective.type) {
        case EntityType.FoodResource:
            ant.task = TaskType.Forage;
            break;
    }
    ant.isBusy = false;
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
            vals.ui.canvasWidth / 2 - vals.ui.edgeMargin,
            Math.max(-vals.ui.canvasWidth / 2 + vals.ui.edgeMargin, coord + biasedOffset)
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
        ant.anchorPoint = { ...ant.coords };
        ant.movingTo = { ...ant.anchorPoint };
    } else {
        ant.anchorPoint.x = (vals.ui.canvasWidth / 2 - ant.coords.x) * 0.15 * Math.random() + ant.coords.x;
        ant.anchorPoint.y = (vals.ui.canvasHeight / 2 - ant.coords.y) * 0.1 * Math.random() + ant.coords.y;
        findIdleCoords(ant);
    }
};

export const findIdleCoords = (ant: Ant) => {
    if (ant.type === AntType.Queen) {
        const nestCoords = getNestEntranceCoords();
        ant.movingTo.x = nestCoords.x + (Math.random() - 1) * 0.1 * vals.ui.canvasWidth;
        ant.movingTo.y = nestCoords.y + (Math.random() - 1) * 0.1 * vals.ui.canvasHeight;
    } else {
        ant.movingTo.x = ant.anchorPoint.x + (Math.random() - 1) * 0.1 * vals.ui.canvasWidth;
        ant.movingTo.y = ant.anchorPoint.y + (Math.random() - 1) * 0.1 * vals.ui.canvasHeight;
    }
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
        ant.movingTo.x = ant.anchorPoint.x + (Math.random()-1) * vals.ant.patrolRange/2;
        ant.movingTo.y = ant.anchorPoint.y + (Math.random()-1) * vals.ant.patrolRange/2;
    } else {
        ant.movingTo = getRandomCoords();
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
        -vals.ui.canvasWidth / 2 + vals.ui.edgeMargin,
        Math.min(vals.ui.canvasWidth / 2 - vals.ui.edgeMargin, coords.x)
    );
    coords.y = Math.max(
        -vals.ui.canvasHeight / 2 + vals.ui.edgeMargin,
        Math.min(vals.ui.canvasHeight / 2 - vals.ui.edgeMargin, coords.y)
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
    ctx.arc(0, 0, vals.ant.patrolRange, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(222, 161, 47, 0.7)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
}

export const drawAttackArrow = (ctx: CanvasRenderingContext2D, ant: Ant) => {
    const enemy = findEnemyByCondition((enemy) => enemy.id === ant.objective);
    if (!enemy) {
        return;
    }
    drawAarow(ctx, ant.coords, enemy.coords, "rgba(236, 4, 4, 0.7)");
}
//add debugging by printing the coords for a unique ant
const drawAarow = (ctx: CanvasRenderingContext2D, from: { x: number, y: number }, to: { x: number, y: number }, color: string) => {
    const distance = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
    if (distance < 20){
        return;
    }
    const headLength = 10;
    const offset = 0;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    const startX = from.x + offset * Math.cos(angle);
    const startY = from.y + offset * Math.sin(angle);   
    const endX = to.x - offset * Math.cos(angle);
    const endY = to.y - offset * Math.sin(angle);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
}