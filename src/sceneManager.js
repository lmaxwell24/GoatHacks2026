class SceneManager {
  constructor() {
    this.scenes = {};
    this.current = null;
  }

  addScene(name, scene) {
    this.scenes[name] = scene;
  }

  setScene(name) {
    this.current = this.scenes[name] || null;
  }

  render(ctx) {
    if (this.current) {
      this.current.draw(ctx);
    }
  }
}

export { SceneManager };
