class SceneManager {
  constructor() {
    this.scenes = {};
    this.current = null;
    this.sceneInitializations = new Map();
  }

  addScene(name, scene) {
    this.scenes[name] = scene;
    this.sceneInitializations.set(name, false);
  }

  setScene(name, player) {
    this.current = this.scenes[name] || null;

    const isFirstTime = !this.sceneInitializations.get(name);

    if (this.current && isFirstTime) {
      if (this.current.tileMap && this.current.tileMap.spawnPoints.length > 0) {
        const spawnPoint = this.current.tileMap.spawnPoints[0];
        const tileSize = this.current.tileMap.tileSize;
        player.position.x = spawnPoint.x * tileSize;
        player.position.y = spawnPoint.y * tileSize;
      }
      this.sceneInitializations.set(name, true);
    }
  }

  getCurrentMap() {
    return this.current ? this.current.tileMap : null;
  }

  render(ctx, offsetX = 0, offsetY = 0) {
    if (this.current) {
      this.current.draw(ctx, offsetX, offsetY);
    }
  }
}

export { SceneManager };
