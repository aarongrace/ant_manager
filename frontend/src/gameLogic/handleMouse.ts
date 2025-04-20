import { useIconsStore } from "../baseClasses/Icon";
import { InteractiveElement } from "../baseClasses/Models";
import { useColonyStore } from "../contexts/colonyStore";
import { useSettingsStore } from "../contexts/settingsStore";

import { debounce } from 'lodash';

export const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const worldX = event.clientX - rect.left;
    const worldY = event.clientY - rect.top;

    const {  mapEntities, enemies } = useColonyStore.getState();
    const { taskIcons: icons } = useIconsStore.getState();
    const clickedElements: InteractiveElement[] = [
        ...mapEntities.filter((entity) => entity.clickable),
        ...icons.filter((icon) => icon.clickable),
        ...enemies.filter((enemy) => enemy.clickable),
    ];

    clickedElements.forEach((element) => {
        const bounds = element.getBounds();
        if (
            worldX >= bounds.left &&
            worldX <= bounds.left + bounds.width &&
            worldY >= bounds.top &&
            worldY <= bounds.top + bounds.height
        ) {
            element.onClick(event);
        }
    });
}


export const handleMouseMove = debounce((e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const worldX = e.clientX - rect.left;
    const worldY = e.clientY - rect.top;
    const { mapEntities } = useColonyStore.getState();
    const { setHoveredEntityId } = useSettingsStore.getState();
    let hoveredId: string | null = null;


    mapEntities.forEach((entity) => {
        const bounds = entity.getBounds();
        if (
            worldX >= bounds.left &&
            worldX <= bounds.left + bounds.width &&
            worldY >= bounds.top &&
            worldY <= bounds.top + bounds.height
        ) {
            hoveredId = entity.id;
        }
    });
    setHoveredEntityId(hoveredId);
    
}, 25);