import { Vector2 } from "./vector.js";

// Default filenames for tile images (assumed to exist in imageDir)
const DEFAULT_TILE_FILENAMES = {
    floor: "floor.png",
    wall: "wall_atlas.png", // Expects a 4x4 atlas for walls
    exit: "exit.png",
    bed1: "bed1.png",
    bed2: "bed2.png",
    spawn: "spawn.png",
    air: null,
};

class TileType {
    constructor(name, char, isCollidable, filename, isAutoTile = false) {
        this.name = name;
        this.char = char;
        this.isCollidable = isCollidable;
        this.filename = filename;
        this.isAutoTile = isAutoTile;
        this.image = null;
    }

    loadImage(imageDir = "src/media/images/tiles") {
        if (!this.filename) {
            return;
        }
        const img = new Image();
        img.src = `${imageDir}/${this.filename}`;
        this.image = img;
    }
}

const TILE_TYPES = {
    FLOOR: new TileType("floor", "f", false, DEFAULT_TILE_FILENAMES.floor),
    WALL: new TileType("wall", "w", true, DEFAULT_TILE_FILENAMES.wall, true),
    EXITDOOR: new TileType("exit", "e", false, DEFAULT_TILE_FILENAMES.exit),
    BED1: new TileType("bed1", "b", true, DEFAULT_TILE_FILENAMES.bed1),
    BED2: new TileType("bed2", "d", true, DEFAULT_TILE_FILENAMES.bed2),
    SPAWN: new TileType("spawn", "s", false, DEFAULT_TILE_FILENAMES.spawn),
    AIR: new TileType("air", "a", false, DEFAULT_TILE_FILENAMES.air),
};

const TILE_TYPE_MAP = {};
for (const type of Object.values(TILE_TYPES)) {
    TILE_TYPE_MAP[type.char] = type;
    type.loadImage();
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

    static async fromFile(path, tileSize = 32) {
        const tilemap = new TileMap(tileSize);
        const response = await fetch(path);
        const data = await response.json();
        const mapName = Object.keys(data)[0];
        const rawMap = data[mapName];
        tilemap.load(rawMap);
        return tilemap;
    }

    load(tilemapData) {
        this.height = tilemapData.length;
        this.width = tilemapData[0].length;
        this.tiles = [];
        this.spawnPoints = [];

        for (let j = 0; j < this.height; j++) {
            this.tiles[j] = [];
            for (let i = 0; i < this.width; i++) {
                const char = tilemapData[j][i];
                const type = tileFromChar(char);
                this.tiles[j][i] = new Tile(i, j, type);
                if (type === TILE_TYPES.SPAWN) {
                    this.spawnPoints.push(new Vector2(i, j));
                }
            }
        }
    }

    render(ctx, offsetX = 0, offsetY = 0) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                const type = tile.type;
                const dx = x * this.tileSize + offsetX;
                const dy = y * this.tileSize + offsetY;

                if (type.isAutoTile) {
                    this.renderAutoTile(ctx, x, y, type, dx, dy);
                } else {
                    this.renderStandardTile(ctx, type, dx, dy);
                }
            }
        }
    }

    renderStandardTile(ctx, type, dx, dy) {
        if (type.image && type.image.complete) {
            ctx.drawImage(type.image, dx, dy, this.tileSize, this.tileSize);
        } else {
            // Fallback rendering
            switch (type) {
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
                default: // FLOOR
                    ctx.fillStyle = "#ccc";
                    break;
            }
            ctx.fillRect(dx, dy, this.tileSize, this.tileSize);
        }
    }

    renderAutoTile(ctx, x, y, type, dx, dy) {
        const N = (y > 0 && this.tiles[y - 1][x].type === type) ? 1 : 0;
        const S = (y < this.height - 1 && this.tiles[y + 1][x].type === type) ? 1 : 0;
        const W = (x > 0 && this.tiles[y][x - 1].type === type) ? 1 : 0;
        const E = (x < this.width - 1 && this.tiles[y][x + 1].type === type) ? 1 : 0;
        const mask = (N << 0) | (E << 1) | (S << 2) | (W << 3);

        if (type.image && type.image.complete) {
            const sx = (mask % 4) * this.tileSize;
            const sy = Math.floor(mask / 4) * this.tileSize;
            ctx.drawImage(type.image, sx, sy, this.tileSize, this.tileSize, dx, dy, this.tileSize, this.tileSize);
        } else {
            // Fallback for autotile
            ctx.fillStyle = "#444";
            ctx.fillRect(dx, dy, this.tileSize, this.tileSize);
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(mask, dx + this.tileSize / 2, dy + this.tileSize / 2);
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
