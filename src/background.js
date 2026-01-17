class Background {
  constructor(image) {
    this.image = image;
  }

  draw(ctx) {
    ctx.drawImage(this.image, 0, 0);
  }
}

const IMAGE_DIR = "./media/images/backgrounds";

export { IMAGE_DIR, Background };
