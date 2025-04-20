import { Enemy } from "../baseClasses/Enemy";
import { useColonyStore } from "../contexts/colonyStore";

export const findEnemyByCondition = (condition: (enemy: Enemy) => boolean): Enemy | null => {
    const { enemies } = useColonyStore.getState();
    for (let enemy of enemies) {
        if (condition(enemy)) {
            return enemy;
        }
    }
    return null;
}