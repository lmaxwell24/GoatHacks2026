import { Player } from "./player.js";

class Game {
    constructor() {
      this.width = 1280;
      this.height = 720;

      this.player = new Player();

    }

    render(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.width, this.height);

        this.player.render(ctx);
    }

    update() {
        this.player.update();
    }

}

export { Game };
