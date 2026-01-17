class Background {
  constructor(image) {
    this.image = image;
  }

  draw(ctx) {
    // Fill canvas with black background first
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Center the image within the canvas
    const canvasWidth = ctx.canvas.width; // 1280
    const canvasHeight = ctx.canvas.height; // 720
    
    // Get actual image dimensions (wait for image to load)
    let imgWidth = this.image.width;
    let imgHeight = this.image.height;
    
    // If image hasn't loaded yet, use estimated dimensions
    if (imgWidth === 0) {
      imgWidth = 800; // Estimate for PNG backgrounds
      imgHeight = 600; // Estimate
    }
    
    // Calculate position to center the image
    const x = (canvasWidth - imgWidth) / 2;
    const y = (canvasHeight - imgHeight) / 2;
    
    ctx.drawImage(this.image, x, y);
  }
}

const IMAGE_DIR = "./media/images";

export { Background, IMAGE_DIR };
