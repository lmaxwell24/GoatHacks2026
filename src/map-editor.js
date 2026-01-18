import { TileMap, TILE_TYPES } from './tile.js';

// --- DOM Elements ---
const mapList = document.getElementById('map-list');
const newMapBtn = document.getElementById('new-map');
const saveMapBtn = document.getElementById('save-map');
const mapNameInput = document.getElementById('map-name');
const mapTextarea = document.getElementById('map-textarea');
const mapCanvas = document.getElementById('map-canvas');
const tilePalette = document.getElementById('tile-palette');
const ctx = mapCanvas.getContext('2d');

// --- State ---
let maps = {};
let selectedMapName = null;
let currentBrush = null;
let isPainting = false;
const tileMap = new TileMap();

// --- Initialization ---
async function main() {
    await loadMaps();
    populatePalette();
    addEventListeners();
    if (Object.keys(maps).length > 0) {
        selectMap(Object.keys(maps)[0]);
    }
}

// --- Map Loading and Selection ---
async function loadMaps() {
    try {
        const response = await fetch('./maps.json');
        maps = await response.json();
    } catch (e) {
        console.error("Could not load maps.json", e);
        maps = { "EMPTY_MAP": [""] };
    }
    renderMapList();
}

function renderMapList() {
    mapList.innerHTML = '';
    for (const name in maps) {
        const li = document.createElement('li');
        li.textContent = name;
        li.dataset.mapName = name;
        li.addEventListener('click', () => selectMap(name));
        mapList.appendChild(li);
    }
    updateMapListSelection();
}

function selectMap(name) {
    if (!maps[name]) return;
    selectedMapName = name;
    mapNameInput.value = name;
    mapTextarea.value = maps[name].join('\n');
    updateMapListSelection();
    renderPreview();
}

function updateMapListSelection() {
    for (const li of mapList.children) {
        li.classList.toggle('selected', li.dataset.mapName === selectedMapName);
    }
}

// --- Palette ---
function populatePalette() {
    tilePalette.innerHTML = '';
    for (const type of Object.values(TILE_TYPES)) {
        const tileDiv = document.createElement('div');
        tileDiv.classList.add('palette-tile');
        tileDiv.dataset.tileChar = type.char;
        tileDiv.title = type.name;

        if (type.image) {
            if (type.isAutoTile) {
                // For autotiles, we can't show a simple preview. Show the char.
                 tileDiv.textContent = type.char;
            } else {
                 tileDiv.style.backgroundImage = `url(${type.image.src})`;
            }
        } else {
            tileDiv.textContent = type.char;
        }

        tileDiv.addEventListener('click', () => selectBrush(type, tileDiv));
        tilePalette.appendChild(tileDiv);
    }
}

function selectBrush(tileType, div) {
    currentBrush = tileType;
    // Update visual selection
    const currentlySelected = tilePalette.querySelector('.selected');
    if (currentlySelected) {
        currentlySelected.classList.remove('selected');
    }
    div.classList.add('selected');
}

// --- Rendering & Editing ---
function renderPreview() {
    const mapData = mapTextarea.value.split('\n');
    
    // Ensure mapData is not empty and has uniform width
    const cleanMapData = mapData.filter(row => row.length > 0);
    if (cleanMapData.length === 0) {
        mapCanvas.width = 0;
        mapCanvas.height = 0;
        return;
    };
    
    const width = Math.max(...cleanMapData.map(r => r.length));
    const paddedMapData = cleanMapData.map(r => r.padEnd(width, ' '));

    tileMap.load(paddedMapData);
    
    mapCanvas.width = tileMap.width * tileMap.tileSize;
    mapCanvas.height = tileMap.height * tileMap.tileSize;
    
    // Redraw
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    tileMap.render(ctx);
}

function paint(event) {
    if (!isPainting || !currentBrush) return;

    const rect = mapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const tileX = Math.floor(x / tileMap.tileSize);
    const tileY = Math.floor(y / tileMap.tileSize);

    if (tileX < 0 || tileY < 0 || tileY >= tileMap.height || tileX >= tileMap.width) return;
    
    let mapRows = mapTextarea.value.split('\n');
    let row = mapRows[tileY];
    
    // Avoid re-painting the same tile
    if (row[tileX] === currentBrush.char) return;

    const newRow = row.substring(0, tileX) + currentBrush.char + row.substring(tileX + 1);
    mapRows[tileY] = newRow;

    mapTextarea.value = mapRows.join('\n');
    renderPreview();
}

// --- Actions ---
function newMap() {
    selectMap('EMPTY_MAP'); // A bit of a hack, assumes it exists
    if (!maps['EMPTY_MAP']) {
        maps['EMPTY_MAP'] = [""];
        renderMapList();
    }
    selectMap('EMPTY_MAP');
    mapNameInput.value = "NewMap";
}

function saveMaps() {
    const name = mapNameInput.value.trim();
    if (!name) {
        alert('Map name cannot be empty');
        return;
    }

    // Save the current state of the textarea to the maps object
    maps[name] = mapTextarea.value.split('\n');
    selectedMapName = name;
    
    const json = JSON.stringify(maps, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maps.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    // Rerender list in case of new map name
    renderMapList();
}

// --- Event Listeners ---
function addEventListeners() {
    mapTextarea.addEventListener('input', renderPreview);
    newMapBtn.addEventListener('click', newMap);
    saveMapBtn.addEventListener('click', saveMaps);

    mapCanvas.addEventListener('mousedown', e => {
        isPainting = true;
        paint(e);
    });
    mapCanvas.addEventListener('mousemove', paint);
    mapCanvas.addEventListener('mouseup', () => isPainting = false);
    mapCanvas.addEventListener('mouseleave', () => isPainting = false);
}

// --- Start ---
main();