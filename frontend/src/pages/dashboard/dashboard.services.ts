import { Ant, AntType } from "../../baseClasses/Ant";
import { createFreshColony, useColonyStore } from "../../contexts/colonyStore";
import { vals } from "../../contexts/globalVars";

export const makeAnt = async (type: AntType) => {
    console.log("Making an ant...");
    const { food, eggs, ants, updateColony, putColonyInfo} = useColonyStore.getState();

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

export const resetColony =() => {
    const { updateColony } = useColonyStore.getState();
    updateColony({
        ...createFreshColony()
    });

}