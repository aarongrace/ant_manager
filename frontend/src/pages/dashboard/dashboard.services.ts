import { Ant, AntType } from "../../baseClasses/Ant";
import { useIconsStore } from "../../baseClasses/Icon";
import { createFreshColony, useColonyStore } from "../../contexts/colonyStore";
import { vals } from "../../contexts/globalVars";

export const makeAnt = async (type: AntType) => {
    console.log("Making an ant...");
    const { food, eggs, ants, updateColony, putColonyInfo } = useColonyStore.getState();

    if (food < vals.food.foodPerAnt) {
        console.log("Not enough food to make an ant");
        return;
    }
    if (eggs < 1) {
        console.log("Not enough eggs to make an ant");
        return;
    }

    const newAnt = Ant.makeNewAnt(type);

    updateColony({
        ants: [...ants, newAnt],
        food: food - vals.food.foodPerAnt,
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
    vals.ui.canvasWidth = window.innerWidth * vals.ui.canvasProportions.width;
    vals.ui.canvasHeight = window.innerHeight * vals.ui.canvasProportions.height;
    initializeIcons();
}