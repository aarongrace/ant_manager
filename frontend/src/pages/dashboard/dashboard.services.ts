import { createFreshColony, useColonyStore } from "../../contexts/colonyStore";
import { Ant, AntTypeEnum, makeNewAnt, recreateQueen, TaskEnum } from "../../baseClasses/Ant";
import { v4 } from "uuid";
import { useSettingsStore } from "../../contexts/settingsStore";

export const makeAnt = async () => {
    console.log("Making an ant...");
    const { food, eggs, ants, updateColony, putColonyInfo} = useColonyStore.getState();
    const { foodPerAnt } = useSettingsStore.getState();

    if (food < foodPerAnt) {
        console.log("Not enough food to make an ant");
        return;
    }
    if (eggs < 1) {
        console.log("Not enough eggs to make an ant");
        return;
    }

    const newAnt = makeNewAnt();

    updateColony({
        ants: [...ants, newAnt],
        food: food - foodPerAnt,
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