import {Game} from "./game.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const game = new Game();
game.openStartingScene();

const updateLoop =
    () => {
      game.update();
      game.render(ctx);
      requestAnimationFrame(updateLoop);
    }

updateLoop();
