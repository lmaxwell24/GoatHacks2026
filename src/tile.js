import { Vector2 } from "./vector.js";

const AUTOTILE_ASSETS = [
    'wall_bottom.png', 'wall_left.png', 'wall_right.png', 'wall_top.png',
    'left_bottom_corner.png', 'left_top_corner.png',
    'right_bottom_corner.png', 'right_top_corner.png'
];

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

    loadImage(imageDir = "media/images/tiles") {
        if (this.isAutoTile) {
            this.autotileImages = new Map();
            const wallDir = `${imageDir}/wall`;
            for (const fname of AUTOTILE_ASSETS) {
                const img = new Image();
                img.src = `${wallDir}/${fname}`;
                // Store by name without extension
                this.autotileImages.set(fname.replace('.png', ''), img);
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
        const N = this.getTileAt(x, y - 1)?.type;
        const S = this.getTileAt(x, y + 1)?.type;
        const E = this.getTileAt(x + 1, y)?.type;
        const W = this.getTileAt(x - 1, y)?.type;

        const isWall = (t) => t?.isAutoTile; // Check if it's a wall type
        const isFloor = (t) => t === TILE_TYPES.FLOOR;

        const wallN = isWall(N), wallS = isWall(S), wallE = isWall(E), wallW = isWall(W);
        const floorN = isFloor(N), floorS = isFloor(S), floorE = isFloor(E), floorW = isFloor(W);
        
        let key = 'debug';

        // Corners
        if (wallS && wallE && !wallN && !wallW) key = 'left_top_corner';
        else if (wallS && wallW && !wallN && !wallE) key = 'right_top_corner';
        else if (wallN && wallE && !wallS && !wallW) key = 'left_bottom_corner';
        else if (wallN && wallW && !wallS && !wallE) key = 'right_bottom_corner';
        
        // Straights
        else if (wallN && wallS) { // Vertical
            if(floorE) key = 'wall_top'; // Left edge of room
            else if(floorW) key = 'wall_bottom'; // Right edge of room
            else key = 'wall_top'; // Default interior
        }
        else if (wallE && wallW) { // Horizontal
            if(floorS) key = 'wall_left'; // Top edge of room
            else if(floorN) key = 'wall_right'; // Bottom edge of room
            else key = 'wall_left'; // Default interior
        }

        // Caps
        else if (wallN) key = 'wall_bottom';
        else if (wallS) key = 'wall_top';
        else if (wallE) key = 'wall_left';
        else if (wallW) key = 'wall_right';
        
        // Isolated
        else key = 'wall_top'; // Fallback for isolated wall block

        let imageToDraw = type.autotileImages.get(key);

        if (imageToDraw && imageToDraw.complete && imageToDraw.naturalWidth !== 0) {
            ctx.drawImage(imageToDraw, dx, dy, this.tileSize, this.tileSize);
        } else {
            // Fallback for autotile if images are not loaded yet or missing
            ctx.fillStyle = "#444";
            ctx.fillRect(dx, dy, this.tileSize, this.tileSize);
            ctx.fillStyle = "white";
            ctx.font = "8px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(key, dx + this.tileSize / 2, dy + this.tileSize / 2);
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