import { Player } from "./player.js";
import { Background, IMAGE_DIR } from "./background.js";

class Game {
    constructor() {
      this.width = 1280;
      this.height = 720;

      this.player = new Player();
      
      const backgroundImage = new Image();
      backgroundImage.width = this.width;
      backgroundImage.height = this.height;
      backgroundImage.src = IMAGE_DIR + "/background-test.png";
      
      this.background = new Background(backgroundImage);
    }

    render(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.width, this.height);

        this.background.draw(ctx);
        this.player.render(ctx);
    }

    update() {
        this.player.update();
    }
}

export { Game };
