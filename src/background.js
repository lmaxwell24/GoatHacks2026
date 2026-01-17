class Background {
  constructor(image) {
    this.image = image;
    this.isLoaded = false;
    
    // Wait for image to load before marking as ready
    this.image.onload = () => {
      this.isLoaded = true;
    };
    
    this.image.onerror = () => {
      console.error(`Error loading image: ${this.image.src}`);
      this.isLoaded = false;
    };
  }

  draw(ctx) {
    // Fill canvas with black background first
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Only draw if image is loaded
    if (!this.isLoaded || !this.image.complete) {
      return;
    }
    
    // Center the image within the canvas
    const canvasWidth = ctx.canvas.width; // 1280
    const canvasHeight = ctx.canvas.height; // 720
    
    // Get actual image dimensions
    const imgWidth = this.image.width;
    const imgHeight = this.image.height;
    
    // Calculate position to center the image
    const x = (canvasWidth - imgWidth) / 2;
    const y = (canvasHeight - imgHeight) / 2;
    
    ctx.drawImage(this.image, x, y);
  }
}

const IMAGE_DIR = "./media/images";

export { Background, IMAGE_DIR };
