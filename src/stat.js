import { MathUtil } from "./mathutil.js";

class Stat {
  constructor({initialValue = 100, hourlyChange = 0, dailyChange = 0, min = 0, max = 100} = {}) {
    this.value = initialValue;
    this.displayValue = initialValue; // Animated display value
    this.hourlyChange = hourlyChange;
    this.dailyChange = dailyChange;
    this.min = min;
    this.max = max;
    this.animationDuration = 400; // ms for bar animation
    this.lastChangeTime = null;
  }

  advanceHour() {
    this.changeValue(this.hourlyChange);
  }

  advanceDay() {
    this.changeValue(this.dailyChange);
  }

  getValue() {
    return this.value;
  }

  changeValue(amount) {
    this.value = MathUtil.clamp(this.value + amount, this.min, this.max);
    this.lastChangeTime = Date.now(); // Start animation
  }

  update() {
    if (this.lastChangeTime === null) return;

    const elapsed = Date.now() - this.lastChangeTime;
    if (elapsed >= this.animationDuration) {
      this.displayValue = this.value;
      this.lastChangeTime = null;
      return;
    }

    // Ease-out animation
    const progress = elapsed / this.animationDuration;
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
    this.displayValue = this.value + (this.displayValue - this.value) * (1 - easeProgress);
  }

  drawBar(ctx, x, y, label, barImage = null) {
    const width = 150;
    const height = 40;
    const labelWidth = width * 0.1; // Left 10% for label space
    const barStartX = x + labelWidth;
    const barWidth = width - labelWidth;

    const percent = (this.displayValue - this.min) / (this.max - this.min);
    const fillWidth = Math.max(0, percent * barWidth);

    // Draw background bar border
    ctx.strokeStyle = "black";
    ctx.strokeRect(barStartX, y, barWidth, height);

    // Color based on value
    let barColor = "blue";
    if (this.displayValue < 30) {
      barColor = "#FF4444";
    } else if (this.displayValue < 60) {
      barColor = "#FFAA00";
    } else {
      barColor = "#00AA00";
    }

    ctx.fillStyle = barColor;
    ctx.fillRect(barStartX, y, fillWidth, height);

    // Draw overlay bar image if provided
    if (barImage) {
      ctx.drawImage(barImage, barStartX, y, barWidth, height);
    }
  }
}

export { Stat };
