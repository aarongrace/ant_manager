import { createFreshColony, useColonyStore } from "../../contexts/colonyStore";
import { vars } from "../../contexts/globalVariables";
import { makeNewAnt } from "../../gameLogic/antHelperFunctions";
import { AntType } from "../../gameLogic/baseClasses/Ant";
import { useIconsStore } from "../../gameLogic/baseClasses/Icon";
import { GameMap } from "../../gameLogic/baseClasses/Map";

export const makeAnt = async (type: AntType) => {
    console.log("Making an ant...");
    const { food, eggs, ants, updateColony, putColonyInfo } = useColonyStore.getState();

    if (food < vars.food.foodPerAnt) {
        console.log("Not enough food to make an ant");
        return;
    }
    if (eggs < 1) {
        console.log("Not enough eggs to make an ant");
        return;
    }

    const newAnt = makeNewAnt(type);

    updateColony({
        ants: [...ants, newAnt],
        food: food - vars.food.foodPerAnt,
        eggs: eggs - 1,
    });
    putColonyInfo();
};

export const resetColony = () => {
    const { updateColony } = useColonyStore.getState();
    updateColony({
        ...createFreshColony()
    });

}
export const resizeCanvas = () => {
    const { initializeIcons } = useIconsStore.getState();
    vars.ui.canvasWidth = Math.min(window.innerWidth * vars.ui.canvasProportions.width, GameMap.mapWidth);;
    vars.ui.canvasHeight = Math.min(window.innerHeight * vars.ui.canvasProportions.height, GameMap.mapHeight);
    initializeIcons();
}