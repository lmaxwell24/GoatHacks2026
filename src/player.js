class Player {
    constructor(name) {
        this.name = name;
        this.score = 0;
    }

    render(ctx) {
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(`Player: ${this.name} Score: ${this.score}`, 10, 30);
  }
}
