class Scene {
  constructor(background, sprites) {
    this.background = background;
    this.sprites = sprites;
  }

  draw(ctx) {
    this.background.draw(ctx);
    this.sprites.forEach(sprite => {
      sprite.draw(ctx);
    });
  }
}

export { Scene };
