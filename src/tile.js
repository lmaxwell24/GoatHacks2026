import { Vector2 } from "./vector.js";

const WALL_AUTOTILE_FILENAMES = {
    // Mapping from bitmask to filename
    1: 'wall_bottom.png', // N
    2: 'wall_left.png',   // E
    3: 'left_bottom_corner.png', // N+E
    4: 'wall_top.png',    // S
    // 5: missing (N+S)
    6: 'left_top_corner.png', // E+S
    // 7: missing (N+E+S)
    8: 'wall_right.png',  // W
    9: 'right_bottom_corner.png', // N+W
    // 10: missing (E+W)
    // 11: missing (N+E+W)
    12: 'right_top_corner.png', // S+W
    // 13: missing (N+S+W)
    // 14: missing (E+S+W)
    // 15: missing (all)
};

// Fallbacks for missing tiles
const WALL_AUTOTILE_FALLBACKS = {
    0: 4, // Isolated -> wall_top
    5: 4, // N+S (vertical) -> wall_top
    7: 6, // N+E+S -> left_top_corner
    10: 2, // E+W (horizontal) -> wall_left
    11: 3, // N+E+W -> left_bottom_corner
    13: 9, // N+S+W -> right_bottom_corner
    14: 6, // E+S+W -> left_top_corner
    15: 6, // ALL -> left_top_corner
}

class TileType {
    constructor(name, char, isCollidable, isAutoTile = false, filename = null) {
        this.name = name;
        this.char = char;
        this.isCollidable = isCollidable;
        this.isAutoTile = isAutoTile;
        this.filename = filename; // For non-autotiles
        
        this.image = null; // For non-autotiles
        this.autotileImages = null; // For autotiles

        this.loadImage();
    }

    loadImage(imageDir = "src/media/images/tiles") {
        if (this.isAutoTile) {
            this.autotileImages = new Map();
            const wallDir = `${imageDir}/wall`;
            for (const [mask, fname] of Object.entries(WALL_AUTOTILE_FILENAMES)) {
                const img = new Image();
                img.src = `${wallDir}/${fname}`;
                this.autotileImages.set(parseInt(mask), img);
            }
        } else if (this.filename) {
            const img = new Image();
            img.src = `${imageDir}/${this.filename}`;
            this.image = img;
        }
    }
}

const TILE_TYPES = {
    FLOOR: new TileType("floor", "f", false, false, "carpet.png"),
    WALL: new TileType("wall", "w", true, true),
    EXITDOOR: new TileType("exit", "e", false, false, "door/door_top.png"),
    BED1: new TileType("bed1", "b", true, false, null),
    BED2: new TileType("bed2", "d", true, false, null),
    SPAWN: new TileType("spawn", "s", false, false, null),
    AIR: new TileType("air", "a", false, false, null),
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
        if (type.image && type.image.complete && type.image.naturalWidth !== 0) {
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

    renderAutoTile(ctx, x, y, type, dx, dy) {
        const N = (y > 0 && this.tiles[y - 1][x].type === type) ? 1 : 0;
        const S = (y < this.height - 1 && this.tiles[y + 1][x].type === type) ? 1 : 0;
        const W = (x > 0 && this.tiles[y][x - 1].type === type) ? 1 : 0;
        const E = (x < this.width - 1 && this.tiles[y][x + 1].type === type) ? 1 : 0;
        let mask = (N << 0) | (E << 1) | (S << 2) | (W << 3);

        let imageToDraw = type.autotileImages.get(mask);

        if (!imageToDraw) {
            const fallbackMask = WALL_AUTOTILE_FALLBACKS[mask];
            imageToDraw = type.autotileImages.get(fallbackMask);
        }

        if (imageToDraw && imageToDraw.complete && imageToDraw.naturalWidth !== 0) {
            ctx.drawImage(imageToDraw, dx, dy, this.tileSize, this.tileSize);
        } else {
            // Fallback for autotile if images are not loaded yet
            ctx.fillStyle = "#444";
            ctx.fillRect(dx, dy, this.tileSize, this.tileSize);
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
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
