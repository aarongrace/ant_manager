import { vals } from "../contexts/globalVars";

export const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Control"){
        console.log("Control key pressed");
        vals.managingPatrol = true;
        

    }
}

export const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Control"){
        vals.managingPatrol = false;
    }
}