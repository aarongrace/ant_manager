import { random } from "lodash";
import { tileData } from "../assets/tileData";
import { vals } from "../contexts/globalVars";
import { maybeGrowFruit } from "../gameLogic/entityHelperFunctions";
export type Tile = [number, number]; // row, col
type Pixel = [number, number, number]; // r, g, b

export class GameMap {

    static mapTileWidth: number = 100;
    static mapTileHeight: number = 72;
    static mapTileSize: number = 16;
    static mapWidth: number = GameMap.mapTileWidth * GameMap.mapTileSize;
    static mapHeight: number = GameMap.mapTileHeight * GameMap.mapTileSize;
    static center: { x: number; y: number } = { x: GameMap.mapWidth / 2, y: GameMap.mapHeight / 2 };
    static focalPoint: { x: number; y: number } = { x: GameMap.mapWidth / 2, y: GameMap.mapHeight / 2 };
    static tilesGrid: Tile[][] = [[]];
    static imageData: ImageData = new ImageData(GameMap.mapWidth, GameMap.mapHeight);
    static partialImageData: ImageData = new ImageData(vals.ui.canvasWidth, vals.ui.canvasHeight);

    static rowsPerSeason: number = 3;

    static normalTile: Tile = [0, 5]
    static grassOneTile: Tile = [0, 6]
    static grassTwoTile: Tile = [0, 7]
    static grassThreeTile: Tile = [0, 8]
    static rockOneTile: Tile = [2, 6]
    static rockTwoTile: Tile = [2, 7]
    static rockThreeTile: Tile = [2, 8]

    static rockClusterSize = 20;

    static updateCounter: number = 0;
    static updateInterval: number = 3;

    static initializeMap() {
        GameMap.initializeTiles();
        GameMap.createFullImageData();
        GameMap.cropImageData();
    }

    static incrementUpdateCounter() {
        GameMap.updateCounter++;
        if (GameMap.updateCounter >= GameMap.updateInterval) {
            GameMap.updateCounter = 0;
            GameMap.updateTiles();
        }
    }


    static updateTiles() {
        try {
            for (let i = 0; i < GameMap.mapTileHeight; i++) {
                for (let j = 0; j < GameMap.mapTileWidth; j++) {
                    const tile = GameMap.tilesGrid[i][j];
                    const randomFactor = Math.random();
                    if (tile === GameMap.normalTile) {
                        const seasonFactor = vals.season === 0 ? 4 :
                        vals.season === 1 ? 2:
                        vals.season === 2 ? 1: 0.2

                        if (randomFactor < 0.003 * seasonFactor) {
                            GameMap.tilesGrid[i][j] = GameMap.grassOneTile;
                        }
                    } else if (tile === GameMap.grassOneTile) {
                        if (randomFactor < 0.4) {
                            GameMap.tilesGrid[i][j] = GameMap.grassTwoTile;
                        }
                    } else if (tile === GameMap.grassTwoTile) {
                        if (randomFactor < 0.4) {
                            GameMap.tilesGrid[i][j] = GameMap.grassThreeTile;
                        }
                    } else if (tile === GameMap.grassThreeTile) {
                        if (randomFactor < 0.4) {
                            GameMap.tilesGrid[i][j] = GameMap.normalTile;
                            maybeGrowFruit({ x: j * GameMap.mapTileSize + GameMap.mapTileSize / 2, y: i * GameMap.mapTileSize + GameMap.mapTileSize / 2 });
                        } 
                    } else if (tile === GameMap.rockOneTile || tile === GameMap.rockTwoTile || tile === GameMap.rockThreeTile) {
                        if (randomFactor < 0.001) {
                            GameMap.tilesGrid[i][j] = GameMap.normalTile;
                            const tileType = randomFactor % 3 === 0 ? GameMap.rockOneTile
                                : randomFactor % 3 === 1 ? GameMap.rockTwoTile
                                : GameMap.rockThreeTile;
                            const neighborRow = Math.min(GameMap.mapTileHeight - 1, Math.max(0, i + Math.floor(Math.random() * 3) - 1));
                            const neighborCol = Math.min(GameMap.mapTileWidth - 1, Math.max(0, j + Math.floor(Math.random() * 3) - 1));
                            GameMap.tilesGrid[neighborRow][neighborCol] = tileType;

                        }
                            
                    }
                }
            }
            GameMap.createFullImageData();
            GameMap.cropImageData();
        } 
        catch (error) {
            console.error("Error updating tiles: ", error);
            GameMap.createFullImageData();
            GameMap.cropImageData();
        }
    }

    static initializeTiles() {
        for (let i = 0; i < GameMap.mapTileHeight; i++) {
            GameMap.tilesGrid[i] = [];
            for (let j = 0; j < GameMap.mapTileWidth; j++) {
                const randomFactor = Math.random();
                const tileType = randomFactor > 0.998 ? GameMap.rockThreeTile
                    : randomFactor > 0.997 ? GameMap.rockTwoTile
                    : randomFactor > 0.994  ? GameMap.rockOneTile
                    : randomFactor > 0.98 ? GameMap.grassThreeTile
                    : randomFactor > 0.97? GameMap.grassTwoTile
                    : randomFactor > 0.95? GameMap.grassOneTile
                    : GameMap.normalTile;
                GameMap.tilesGrid[i][j] = tileType
            }
        }

        const clusters: {row: number, col: number}[]= [];
        clusters.push({ row: Math.floor(GameMap.mapTileHeight / 2 + Math.random()*2*GameMap.rockClusterSize), 
            col: Math.floor(GameMap.mapTileWidth / 2) + Math.random()*2*GameMap.rockClusterSize });

        // clusters.push({ row: Math.floor(GameMap.mapTileHeight / 2 + (Math.random() + ), col: Math.floor(GameMap.mapTileWidth / 2) });

        let attempts = 0;
        while (attempts < 100) {
            const row = Math.floor(Math.random() * GameMap.mapTileHeight);
            const col = Math.floor(Math.random() * GameMap.mapTileWidth);
            if (!clusters.some((cluster) => {
                const dist = Math.sqrt((cluster.row - row) ** 2 + (cluster.col - col) ** 2);
                return dist < GameMap.rockClusterSize/3;
            })) {
                clusters.push({ row, col });
            }
            attempts++;
        }

        clusters.forEach((cluster) => {
            const clusterWidth = Math.floor(GameMap.rockClusterSize * Math.random());
            const clusterHeight = Math.floor(GameMap.rockClusterSize * Math.random());
            const startRow = Math.max(0, cluster.row - Math.floor(clusterHeight / 2));
            const startCol = Math.max(0, cluster.col - Math.floor(clusterWidth / 2));
            const endRow = Math.min(GameMap.mapTileHeight - 1, cluster.row + Math.floor(clusterHeight / 2));
            const endCol = Math.min(GameMap.mapTileWidth - 1, cluster.col + Math.floor(clusterWidth / 2));
            for (let i = startRow; i <= endRow; i++) {
                for (let j = startCol; j <= endCol; j++) {
                    const distFactor = 1- Math.sqrt((i - cluster.row) ** 2 + (j - cluster.col) ** 2)/GameMap.rockClusterSize;
                    
                    const randomFactor = Math.pow(Math.random(), (1/(distFactor + 0.01))**2);
                    const tileType = randomFactor > 0.95
                        ? GameMap.rockThreeTile
                        : randomFactor > 0.87
                        ? GameMap.rockTwoTile
                        : randomFactor > 0.82
                        ? GameMap.rockOneTile
                        : GameMap.normalTile;

                    if (tileType !== GameMap.normalTile) {
                        GameMap.tilesGrid[i][j] = tileType;
                    }
                }
            }
        });
    }

    // not in use due to edge scroll
    static createPartialImageData() {
        const viewportWidth = Math.ceil(vals.ui.canvasWidth);
        const viewportHeight = Math.ceil(vals.ui.canvasHeight);
        GameMap.partialImageData= new ImageData(viewportWidth, viewportHeight);
        const viewportLeft = Math.ceil(GameMap.focalPoint.x - viewportWidth / 2);
        const viewportTop = Math.ceil(GameMap.focalPoint.y - viewportHeight / 2);
        const tileSize = GameMap.mapTileSize;

        for (let y = 0; y < viewportHeight; y++) {
            for (let x = 0; x < viewportWidth; x++) {
                const worldX = viewportLeft + x;
                const worldY = viewportTop + y;

                const tileCol = Math.floor(worldX / tileSize);
                const tileRow = Math.floor(worldY / tileSize);

                const pixelX = worldX % tileSize;
                const pixelY = worldY % tileSize;
                if (tileRow >= 0 && tileRow < GameMap.mapTileHeight &&
                    tileCol >= 0 && tileCol < GameMap.mapTileWidth &&
                    pixelX >= 0 && pixelX < tileSize &&
                    pixelY >= 0 && pixelY < tileSize) {
                    const tile = GameMap.tilesGrid[tileRow][tileCol];
                    const pixel = tileData[tile[0] + vals.season * GameMap.rowsPerSeason][tile[1]][pixelY][pixelX];
                    const index = (y * viewportWidth + x) * 4;
                    GameMap.partialImageData.data[index] = pixel[0];     // R
                    GameMap.partialImageData.data[index + 1] = pixel[1]; // G
                    GameMap.partialImageData.data[index + 2] = pixel[2]; // B
                    GameMap.partialImageData.data[index + 3] = 255;     // A
                }
            }
        }
    }

    static createFullImageData() {
        for (let tileRow = 0; tileRow < GameMap.mapTileHeight; tileRow++) {
            for (let tileCol = 0; tileCol < GameMap.mapTileWidth; tileCol++) {
                const tileIndex = GameMap.tilesGrid[tileRow][tileCol];
                const tile = tileData[tileIndex[0] + vals.season * GameMap.rowsPerSeason][tileIndex[1]];
                for (let pixelY = 0; pixelY < GameMap.mapTileSize; pixelY++) {
                    for (let pixelX = 0; pixelX < GameMap.mapTileSize; pixelX++) {
                        const pixel = tile[pixelY][pixelX];
                        const index = ((tileRow * GameMap.mapTileSize + pixelY) * GameMap.mapWidth + (tileCol * GameMap.mapTileSize + pixelX)) * 4;
                        GameMap.imageData.data[index] = pixel[0];     // R
                        GameMap.imageData.data[index + 1] = pixel[1]; // G
                        GameMap.imageData.data[index + 2] = pixel[2]; // B
                        GameMap.imageData.data[index + 3] = 255;     // A
                    }
                }
            }
        }
    }

    static cropImageData() {
        const viewportWidth = Math.ceil(vals.ui.canvasWidth);
        const viewportHeight = Math.ceil(vals.ui.canvasHeight);
        const viewportTopLeft = GameMap.getViewportTopLeft();
        GameMap.partialImageData = new ImageData(viewportWidth, viewportHeight);

        const fullCanvas = document.createElement("canvas");
        fullCanvas.width = GameMap.mapWidth;
        fullCanvas.height = GameMap.mapHeight;
        const fullCtx = fullCanvas.getContext("2d");
        if (!fullCtx) {
            console.error("Failed to get 2D context for full canvas");
            return;
        }
        fullCtx.putImageData(GameMap.imageData, 0, 0);
        GameMap.partialImageData = fullCtx.getImageData(viewportTopLeft.x, viewportTopLeft.y, viewportWidth, viewportHeight);
    }


    static setTilesArray(tiles: Tile[][]) {
        if (tiles.length !== GameMap.mapTileHeight || tiles[0].length !== GameMap.mapTileWidth) {
            console.error("Invalid tile array dimensions");
            GameMap.initializeMap();
        } else {
            GameMap.tilesGrid = tiles;
            GameMap.createPartialImageData();
        }
    }


    static drawMap(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.putImageData(
            GameMap.partialImageData,
            0, 0);
        ctx.restore();
    }

    static getCoordsCloseToCenter(distance: number): { x: number; y: number } {
        const x = GameMap.center.x + random(-distance, distance);
        const y = GameMap.center.y + random(-distance, distance);
        return { x, y };
    }

    static getViewportTopLeft(): { x: number; y: number } {
        const viewportWidth = Math.ceil(vals.ui.canvasWidth);
        const viewportHeight = Math.ceil(vals.ui.canvasHeight);
        const viewportLeft = Math.ceil(GameMap.focalPoint.x - viewportWidth / 2);
        const viewportTop = Math.ceil(GameMap.focalPoint.y - viewportHeight / 2);
        return { x: viewportLeft, y: viewportTop };
    }
}