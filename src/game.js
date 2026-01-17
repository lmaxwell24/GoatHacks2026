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

    addPlayer(player) {
        if (this.state === 'waiting') {
            this.players.push(player);
            console.log(`Player ${player.name} has joined the game.`);
        } else {
            console.log('Cannot join, game already started.');
        }
    }

    startGame() {
        if (this.players.length > 0) {
            this.state = 'playing';
            console.log('Game has started!');
        } else {
            console.log('Cannot start game, no players have joined.');
        }
    }

    endGame() {
        this.state = 'ended';
        console.log('Game has ended!');
    }
}

export { Game };
