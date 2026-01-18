import { Vector2 } from "./vector.js";

class TileType {
    constructor(name, char, isCollidable, filename = null) {
        this.name = name;
        this.char = char;
        this.isCollidable = isCollidable;
        this.filename = filename;
        
        this.image = null;

        this.loadImage();
    }

    loadImage(imageDir = "media/images/tiles") {
        if (this.filename) {
            const img = new Image();
            img.src = `${imageDir}/${this.filename}`;
            this.image = img;
        }
    }
}

const TILE_TYPES = {
    FLOOR: new TileType("floor", "f", false, "carpet.png"),
    WALL: new TileType("wall", "w", true, null), // Walls are now a fixed color
    EXITDOOR: new TileType("exit", "e", false, "door/door_top.png"),
    BED1: new TileType("bed1", "b", true, null),
    BED2: new TileType("bed2", "d", true, null),
    SPAWN: new TileType("spawn", "s", false, null),
    AIR: new TileType("air", "a", false, null),
};

const TILE_TYPE_MAP = {};
for (const type of Object.values(TILE_TYPES)) {
    TILE_TYPE_MAP[type.char] = type;
}

const tileFromChar = (char) => {
    return TILE_TYPE_MAP[char] || TILE_TYPES.FLOOR;
}

class Tile {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }
}

class TileMap {
    constructor(tileSize = 32) {
        this.tiles = [];
        this.width = 0;
        this.height = 0;
        this.tileSize = tileSize;
        this.spawnPoints = [];
    }

    static async fromFile(path, mapName, tileSize = 32) {
        const tilemap = new TileMap(tileSize);
        const response = await fetch(path);
        const data = await response.json();
        const rawMap = data[mapName];
        if (!rawMap) {
            console.error(`Map "${mapName}" not found in ${path}`);
            return null;
        }
        tilemap.load(rawMap);
        return tilemap;
    }

    load(tilemapData) {
        if (!tilemapData || tilemapData.length === 0) {
            this.height = 0;
            this.width = 0;
            this.tiles = [];
            return;
        }
        this.height = tilemapData.length;
        this.width = tilemapData[0].length;
        this.tiles = [];
        this.spawnPoints = [];

        for (let j = 0; j < this.height; j++) {
            this.tiles[j] = [];
            for (let i = 0; i < this.width; i++) {
                const char = tilemapData[j][i] || ' ';
                const type = tileFromChar(char);
                this.tiles[j][i] = new Tile(i, j, type);
                if (type === TILE_TYPES.SPAWN) {
                    this.spawnPoints.push(new Vector2(i, j));
                }
            }
        }
    }

    isWorldRectCollidable(rect) {
        const points = [
            { x: rect.x, y: rect.y }, // top-left
            { x: rect.x + rect.width, y: rect.y }, // top-right
            { x: rect.x, y: rect.y + rect.height }, // bottom-left
            { x: rect.x + rect.width, y: rect.y + rect.height }, // bottom-right
        ];

        for (const point of points) {
            const tileX = Math.floor(point.x / this.tileSize);
            const tileY = Math.floor(point.y / this.tileSize);
            const tile = this.getTileAt(tileX, tileY);
            if (tile && tile.type.isCollidable) {
                return true;
            }
        }
        return false;
    }

    render(ctx, offsetX = 0, offsetY = 0) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                const type = tile.type;
                const dx = x * this.tileSize + offsetX;
                const dy = y * this.tileSize + offsetY;

                this.renderStandardTile(ctx, type, dx, dy);
            }
        }
    }

    renderStandardTile(ctx, type, dx, dy) {
        if (type.image && type.image.complete && type.image.naturalWidth !== 0) {
            ctx.drawImage(type.image, dx, dy, this.tileSize, this.tileSize);
        } else {
            // Fallback rendering
            switch (type) {
                case TILE_TYPES.WALL:
                    ctx.fillStyle = "#444"; // Fixed color for walls
                    break;
                case TILE_TYPES.BED1:
                case TILE_TYPES.BED2:
                    ctx.fillStyle = "#b5651d";
                    break;
                case TILE_TYPES.SPAWN:
                    ctx.fillStyle = "#0f0";
                    break;
                case TILE_TYPES.AIR:
                    ctx.clearRect(dx, dy, this.tileSize, this.tileSize);
                    return;
                case TILE_TYPES.FLOOR:
                    ctx.fillStyle = "#ccc";
                    break;
                default:
                    ctx.fillStyle = "#ff00ff"; // Should not happen
                    break;
            }
            ctx.fillRect(dx, dy, this.tileSize, this.tileSize);
        }
    }

    getTileAt(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return null;
        }
        return this.tiles[y][x];
    }
}

export { Tile, TileMap, TILE_TYPES, tileFromChar };