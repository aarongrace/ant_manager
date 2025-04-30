import { create } from "zustand";
import { useColonyStore } from "../contexts/colonyStore";
import { vars } from "../contexts/globalVariables"; // Updated to use env
import { usePreloadedImagesStore } from "../contexts/preloadImages";
import { setOneAntToTask } from "../gameLogic/antHelperFunctions";
import { AntType, TaskType } from "./Ant";
import { InteractiveElement } from "./Models";

export class TaskIcon implements InteractiveElement {
    static defaultSize = { width: 37, height: 40 };
    static bottomMargin = 5;
    static leftMargin = 10;
    static betweenMargin = 27;
    static textMargin = 4;
    clickable: boolean = true;
    type: TaskType;
    pos: { x: number; y: number };
    size: { width: number; height: number } = TaskIcon.defaultSize;

    hoverable: boolean = true;
    isHovered: boolean = false;

    static getTaskIconAreaBounds = () => {
        const height = TaskIcon.defaultSize.height + TaskIcon.bottomMargin * 2;
        return {
            left: 0,
            top: vars.ui.canvasHeight - height, // Updated to use env
            width:
                (TaskIcon.defaultSize.width +
                    TaskIcon.betweenMargin +
                    TaskIcon.textMargin) *
                    Object.values(TaskType).length +
                TaskIcon.leftMargin * 2,
            height: height,
        };
    };

    constructor(type: TaskType, coords: { x: number; y: number }) {
        this.type = type;
        this.pos = coords;
    }

    onClick = (event: React.MouseEvent<HTMLCanvasElement>): void => {
        const { setTaskNumbers } = useIconsStore.getState();
        console.log(`Icon clicked: ${this.type}`);
        setOneAntToTask(this.type);
        setTaskNumbers();
    };

    getBounds = () => {
        return {
            left: this.pos.x - this.size.width / 2,
            top: this.pos.y - this.size.height / 2,
            width: this.size.width,
            height: this.size.height,
        };
    };

    draw(ctx: CanvasRenderingContext2D): void {
        const { getImage } = usePreloadedImagesStore.getState();
        const { getTaskNumbers } = useIconsStore.getState();
        const img = getImage(this.type);
        if (!img) {
            console.error(`Image for icon type ${this.type} not loaded`);
            return;
        }
        ctx.drawImage(
            img,
            this.pos.x - this.size.width / 2,
            this.pos.y - this.size.height / 2,
            this.size.width,
            this.size.height
        );
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "bold 25px Arial";
        ctx.textBaseline = "middle";
        const textX = this.pos.x + this.size.width / 2 + TaskIcon.textMargin;
        const textY = this.pos.y;
        ctx.fillText(getTaskNumbers(this.type).toString(), textX, textY);
    }
}

type IconsStore = {
    taskIcons: TaskIcon[];
    taskNumbers: Record<TaskType, number>;
    initializeIcons: () => void;
    setTaskNumbers: () => void;
    getTaskNumbers: (task: TaskType) => number;
};

export const useIconsStore = create<IconsStore>((set, get) => ({
    taskIcons: [],
    taskNumbers: { [TaskType.Forage]: 0, [TaskType.Attack]: 0, [TaskType.Idle]: 0, [TaskType.Patrol]: 0, },
    getIcons: () => get().taskIcons,
    initializeIcons: () => {
        get().setTaskNumbers();
        const icons: TaskIcon[] = [];
        const iconTypes = Object.values(TaskType);
        const iconY =
            vars.ui.canvasHeight - // Updated to use env
            TaskIcon.defaultSize.height / 2 -
            TaskIcon.bottomMargin;
        iconTypes.forEach((type, index) => {
            icons.push(
                new TaskIcon(type as TaskType, {
                    x:
                        TaskIcon.leftMargin +
                        TaskIcon.defaultSize.width / 2 +
                        index *
                            (TaskIcon.defaultSize.width +
                                TaskIcon.betweenMargin +
                                TaskIcon.textMargin),
                    y: iconY,
                })
            );
        });
        set(() => ({ taskIcons: icons }));
    },
    setTaskNumbers: () => {
        const { ants } = useColonyStore.getState();
        const taskNumbers: Record<TaskType, number> = {
            [TaskType.Forage]: 0,
            [TaskType.Attack]: 0,
            [TaskType.Idle]: 0,
            [TaskType.Patrol]: 0,
        };
        ants.forEach((ant) => {
            if (ant.type !== AntType.Queen) {
                taskNumbers[ant.task]++;
            }
        });
        set(() => ({ taskNumbers: taskNumbers }));
    },
    getTaskNumbers(task) {
        return get().taskNumbers[task];
    },
}));