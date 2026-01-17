class Scene {
  constructor(background, sprites = []) {
    this.background = background;
    this.sprites = sprites;
  }

  draw(ctx) {
    if (this.background) this.background.draw(ctx);
    this.sprites.forEach(s => s.draw(ctx));
  }
}

export { Scene };
