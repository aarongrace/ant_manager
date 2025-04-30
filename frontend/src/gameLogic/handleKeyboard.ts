import { vars } from "../contexts/globalVariables";

export const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Control"){
        console.log("Control key pressed");
        vars.managingPatrol = true;
        

    }
}

export const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Control"){
        vars.managingPatrol = false;
    }
}