import {Game} from "./game.js";
import {render} from "./render.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const game = new Game();

const updateLoop =
    () => {
      game.update();
      game.render(ctx);
      requestAnimationFrame(updateLoop);
    }

updateLoop();
