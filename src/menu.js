class Menu {
  constructor() {
    this.options = [];
    this.selected = 0;
    this.active = false;
    this.onSelect = null;
    this.emphasizeIndex = -1; // Index of option to emphasize
  }

  open(options, callback, emphasizeIndex = -1) {
    this.options = options;
    this.selected = 0;
    this.active = true;
    this.onSelect = callback;
    this.emphasizeIndex = emphasizeIndex;
  }

  close() {
    this.active = false;
  }

  handleKey(e) {
    if (!this.active) return;

    if (e.key === "ArrowUp") {
      this.selected = (this.selected - 1 + this.options.length) % this.options.length;
    }

    if (e.key === "ArrowDown") {
      this.selected = (this.selected + 1) % this.options.length;
    }

    if (e.key === "Enter") {
      const choice = this.options[this.selected];
      this.close();
      if (this.onSelect) this.onSelect(choice);
    }
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, 1280, 720);

    ctx.font = "32px sans-serif";

    this.options.forEach((opt, i) => {
      const y = 250 + i * 50;
      
      // Determine color
      let fillColor = "white";
      if (i === this.selected) {
        fillColor = "yellow";
      } else if (i === this.emphasizeIndex) {
        fillColor = "#FF6B6B"; // Red for emphasized
      }
      
      ctx.fillStyle = fillColor;
      
      // Underline emphasized option if not selected
      if (i === this.emphasizeIndex && i !== this.selected) {
        ctx.fillText(opt, 200, y);
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = 2;
        const metrics = ctx.measureText(opt);
        ctx.beginPath();
        ctx.moveTo(200, y + 5);
        ctx.lineTo(200 + metrics.width, y + 5);
        ctx.stroke();
      } else {
        ctx.fillText(opt, 200, y);
      }
    });
  }
}

export { Menu };
