class Sprite {
  constructor(image, x, y) {
    this.image = image;
    this.x = x;
    this.y = y;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y);
  }
}

export { Sprite };
