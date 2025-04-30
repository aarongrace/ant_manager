import { v4 } from "uuid";
import { usePreloadedImagesStore } from "../contexts/preloadImages";
import { EntityType, MapEntity } from "./MapEntity";
import { Bounds } from "./Models";

export class EnemyCorpse extends MapEntity{
    hoverable = false;
    isHovered = false;
    spriteFrames: number;

    initial_amount: number;
    isDepleted = false;

    constructor(
        imageName: string,
        coords: { x: number; y: number },
        size: { width: number; height: number },
        initial_amount: number,
        spriteFrames: number = 4,
    ) {
        super(
            v4(),
            EntityType.ChitinSource,
            coords,
            size,
            initial_amount,
            imageName,
        );
        this.initial_amount = initial_amount;
        this.spriteFrames = spriteFrames;
    }

    draw(ctx: CanvasRenderingContext2D, bounds:Bounds = this.getBounds()): void {
        if (this.amount <= 0){
            this.isDepleted = true;
            return;
        }
        const { getImage } = usePreloadedImagesStore.getState();
        const img = getImage(this.imgName);
        const frame = this.spriteFrames - Math.floor((this.amount * 1.1 / this.initial_amount) * this.spriteFrames);
        
        if (!img) {
            console.error(`Image for entity ${this.imgName} not loaded`);
            return;
        }
        ctx.drawImage(
            img,
            frame * img.width / this.spriteFrames,
            0,
            img.width / this.spriteFrames,
            img.height,
            bounds.left,
            bounds.top,
            bounds.width,
            bounds.height
        );
    }
}

export const generateEnemyCorpse = (enemyName: string, coords: { x: number; y: number }, initial_amount: number, size: { width: number; height: number }) => {
    const imageName = `${enemyName}_corpse`;

    const enemyCorpse = new EnemyCorpse(
        imageName,
        coords,
        size,
        initial_amount
    );
    return enemyCorpse;
}