class Scene {
  constructor(background, sprites = [], tileMap = null) {
    this.background = background;
    this.sprites = sprites;
    this.tileMap = tileMap;
  }

  draw(ctx, offsetX = 0, offsetY = 0) {
    if (this.background) this.background.draw(ctx);
    if (this.tileMap) this.tileMap.render(ctx, offsetX, offsetY);
    this.sprites.forEach(s => s.draw(ctx, offsetX, offsetY));
  }
}

export { Scene };
