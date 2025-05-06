import { vars } from "../contexts/globalVariables";

export const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Control"){
        console.log("Control key pressed");
        vars.showPatrolCircle = true;
        vars.showAttackArrow = true;
        vars.showForageArrow = true;
    }
}

export const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Control"){
        vars.showPatrolCircle = false;
        vars.showAttackArrow = false;
        vars.showForageArrow = false;
    }
}