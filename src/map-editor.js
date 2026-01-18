import { TileMap, tileFromChar } from './tile.js';

const mapList = document.getElementById('map-list');
const newMapBtn = document.getElementById('new-map');
const mapNameInput = document.getElementById('map-name');
const mapTextarea = document.getElementById('map-textarea');
const saveMapBtn = document.getElementById('save-map');
const mapCanvas = document.getElementById('map-canvas');
const ctx = mapCanvas.getContext('2d');

let maps = {};
let selectedMap = null;
const tileMap = new TileMap();

async function loadMaps() {
    const response = await fetch('./maps.json');
    maps = await response.json();
    renderMapList();
}

function renderMapList() {
    mapList.innerHTML = '';
    for (const name in maps) {
        const li = document.createElement('li');
        li.textContent = name;
        li.addEventListener('click', () => selectMap(name));
        mapList.appendChild(li);
    }
}

function selectMap(name) {
    if (selectedMap) {
        const oldLi = Array.from(mapList.children).find(li => li.textContent === selectedMap);
        if(oldLi) oldLi.classList.remove('selected');
    }

    selectedMap = name;
    const li = Array.from(mapList.children).find(li => li.textContent === selectedMap);
    if(li) li.classList.add('selected');

    mapNameInput.value = name;
    mapTextarea.value = maps[name].join('\n');
    renderPreview();
}

function renderPreview() {
    const mapData = mapTextarea.value.split('\n').filter(row => row.length > 0);
    if (mapData.length === 0) {
        mapCanvas.width = 0;
        mapCanvas.height = 0;
        return;
    };
    
    tileMap.load(mapData);
    
    mapCanvas.width = tileMap.width * tileMap.tileSize;
    mapCanvas.height = tileMap.height * tileMap.tileSize;
    
    tileMap.render(ctx);
}

function newMap() {
    if (selectedMap) {
        const oldLi = Array.from(mapList.children).find(li => li.textContent === selectedMap);
        if(oldLi) oldLi.classList.remove('selected');
    }
    selectedMap = null;
    mapNameInput.value = 'NewMap';
    mapTextarea.value = '';
    renderPreview();
}

function saveMap() {
    const name = mapNameInput.value;
    if (!name) {
        alert('Map name cannot be empty');
        return;
    }

    const mapData = mapTextarea.value.split('\n');
    maps[name] = mapData;
    
    const json = JSON.stringify(maps, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maps.json';
    a.click();
    
    URL.revokeObjectURL(url);
    
    // Rerender list in case of new map
    renderMapList();
    selectMap(name);
}


mapTextarea.addEventListener('input', renderPreview);
newMapBtn.addEventListener('click', newMap);
saveMapBtn.addEventListener('click', saveMap);

loadMaps();
