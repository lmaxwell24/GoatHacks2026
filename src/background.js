class Background {
  constructor(image) {
    this.image = image;
  }

  draw(ctx) {
    ctx.draw(this.image, 0, 0);
  }
}

export { Background };
