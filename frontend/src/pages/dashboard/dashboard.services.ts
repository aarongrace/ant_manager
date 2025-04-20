import { AntTypes, makeNewAnt } from "../../baseClasses/Ant";
import { createFreshColony, useColonyStore } from "../../contexts/colonyStore";
import { useSettingsStore } from "../../contexts/settingsStore";

export const makeAnt = async (type: AntTypes) => {
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

    const newAnt = makeNewAnt(type);

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