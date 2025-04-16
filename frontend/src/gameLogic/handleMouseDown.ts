import { AntTypeEnum, TaskEnum } from "../baseClasses/Ant";
import { EntityTypeEnum, MapEntity } from "../baseClasses/MapEntity";
import { useColonyStore } from "../contexts/colonyStore";
import { findFirstAntByTargetEntity as findAntByTargetEntity, findAntByTaskAndOrObjective as findAntByTask, setAntObjective, setAntToIdle } from "./antHelperFunctions";
import { getEntityBounds } from "./entityHelperFunctions";

export const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const worldX = event.clientX - rect.left;
    const worldY = event.clientY - rect.top;

    const {  mapEntities } = useColonyStore.getState();



    mapEntities.forEach((entity) => {
        const bounds = getEntityBounds(entity);
        if (
            worldX >= bounds.left &&
            worldX <= bounds.left + bounds.width &&
            worldY >= bounds.top &&
            worldY <= bounds.top + bounds.height
        ) {
            if (entity.type === EntityTypeEnum.FoodResource) {
                handleFoodSourceClick(event, entity);
            }
        }
    });
}

const handleFoodSourceClick = (event: React.MouseEvent<HTMLCanvasElement>, entity: MapEntity) => {
    const {ants} = useColonyStore.getState();
    if (event.button === 0){
        // send ant to food source if left click
        var ant = findAntByTask(TaskEnum.Idle);
        if (!ant) {
            ant = findAntByTask(TaskEnum.Foraging, entity.id);
        }
        if (!ant) { // find any available ant
            ant = ants.filter(ant => ant.objective !== entity.id && ant.type !== AntTypeEnum.Queen)[0];
        }
        if (ant) {
            setAntObjective(ant, entity);
            console.log(`Assigned ${ant.id} to food source ${entity.id}`);
        } else {
            console.log("No available ants to assign to food source");
        }
    } else if (event.button === 2) {
        // remove food source if right click
        const ant = findAntByTargetEntity(entity);
        if (ant){
            setAntToIdle(ant);
        }

    }

}