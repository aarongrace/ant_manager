import { useColonyStore } from "../contexts/colonyStore";
import { Enemy } from "./baseClasses/Enemy";

export const findEnemyByCondition = (condition: (enemy: Enemy) => boolean): Enemy | null => {
    const { enemies } = useColonyStore.getState();
    for (let enemy of enemies) {
        if (condition(enemy)) {
            return enemy;
        }
    }
    return null;
}

export const findClosestEnemy = (coords: { x: number, y: number }): Enemy | null => {
    const { enemies } = useColonyStore.getState();

    return enemies.reduce<{ enemy: Enemy; distance: number } | null>
        ((closest, enemy) => {
            const dx = enemy.coords.x - coords.x;
            const dy = enemy.coords.y - coords.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return !closest || distance < closest.distance ?
                { enemy, distance } : closest;
        }, null)?.enemy || null;
}