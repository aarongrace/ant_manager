import { create } from "zustand";
import { useColonyStore } from "../contexts/colonyStore";
import { usePreloadedImagesStore } from "../contexts/preloadImages";
import { useSettingsStore } from "../contexts/settingsStore";
import { setOneAntToTask } from "../gameLogic/antHelperFunctions";
import { AntTypes, TaskTypes as TaskType } from "./Ant";
import { InteractiveElement } from "./Models";


export class TaskIcon implements InteractiveElement{
    static defaultSize = { width: 37, height: 40 };
    static bottomMargin = 5;
    static leftMargin = 10;
    static betweenMargin = 15;
    static textMargin = 15;
    clickable: boolean = true;
    type: TaskType;
    coords: { x: number; y: number };
    size: { width: number; height: number } = TaskIcon.defaultSize;


    static getTaskIconAreaBounds = () => {
        const { canvasWidth, canvasHeight } = useSettingsStore.getState();
        const iconTop = canvasHeight - TaskIcon.defaultSize.height - TaskIcon.bottomMargin;
        const height = TaskIcon.defaultSize.height + TaskIcon.bottomMargin * 2;
        return {
            left: 0,
            top: canvasHeight - height,
            width: (TaskIcon.defaultSize.width + TaskIcon.betweenMargin + TaskIcon.textMargin) 
            * Object.values(TaskType).length + TaskIcon.leftMargin,
            height: height,
        };
    }
    constructor(type: TaskType, coords: { x: number; y: number}) {
        this.type = type;
        this.coords = coords;
    }

    onClick =  (event: React.MouseEvent<HTMLCanvasElement>):void => {
        console.log(`Icon clicked: ${this.type}`);
        setOneAntToTask(this.type);
    };
    getBounds = () => {
        return {
            left: this.coords.x - this.size.width / 2,
            top: this.coords.y - this.size.height / 2,
            width: this.size.width,
            height: this.size.height,
        };
    }
    draw(ctx: CanvasRenderingContext2D): void {
        console.log(this);
        const { getImage } = usePreloadedImagesStore.getState();
        const { getTaskNumbers } = useIconsStore.getState();
        const img = getImage(this.type);
        if (!img) {
            console.error(`Image for icon type ${this.type} not loaded`);
            return;
        }
        ctx.drawImage(img, this.coords.x - this.size.width / 2, this.coords.y - this.size.height / 2, this.size.width, this.size.height);
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "bold 25px Arial";
        ctx.textBaseline = "middle";
        const textX = this.coords.x + this.size.width / 2 + 10;
        const textY = this.coords.y;
        ctx.fillText(getTaskNumbers(this.type).toString(), textX, textY);
    }


}

type IconsStore = {
    taskIcons: TaskIcon[];
    taskNumbers: Record<TaskType, number>;
    initializeIcons: () => void;
    setTaskNumbers:()=> void;
    getTaskNumbers: (task:TaskType) => number;
}


export const useIconsStore = create<IconsStore>((set, get) => ({
    taskIcons: [],
    taskNumbers: { [TaskType.Forage]: 0, [TaskType.Attack]: 0, [TaskType.Idle]: 0, [TaskType.Patrol]: 0, },
    getIcons: () => get().taskIcons,
    initializeIcons: () => {
        get().setTaskNumbers();
        const { canvasWidth: width, canvasHeight: canvasHeight } = useSettingsStore.getState();
        const icons: TaskIcon[] = [];
        const iconTypes = Object.values(TaskType);
        const iconY = canvasHeight - TaskIcon.defaultSize.height/2 - TaskIcon.bottomMargin;
        iconTypes.forEach((type, index) => {
            icons.push(new TaskIcon(type as TaskType,
                { x: TaskIcon.leftMargin + TaskIcon.defaultSize.width / 2 + index * (TaskIcon.defaultSize.width + TaskIcon.betweenMargin + TaskIcon.textMargin), y: iconY },))
        });
        set(()=> ({ taskIcons: icons }) );
    },
    setTaskNumbers: () => {
        const { ants } = useColonyStore.getState();
        const taskNumbers: Record<TaskType, number> = { [TaskType.Forage]: 0, [TaskType.Attack]: 0, [TaskType.Idle]: 0, [TaskType.Patrol]: 0, };
        ants.forEach((ant) => {
            if (ant.type !== AntTypes.Queen) {
                taskNumbers[ant.task]++;
            }
        });
        set(() => ({ taskNumbers: taskNumbers }));
    },
    getTaskNumbers(task) { return get().taskNumbers[task]; },
}));