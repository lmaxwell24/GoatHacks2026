import { MathUtil } from "./mathutil.js";

class Stat {
  constructor({initialValue = 100, hourlyChange = 0, dailyChange = 0, sleepChange = 0, min = 0, max = 100} = {}) {
    this.value = initialValue;
    this.hourlyChange = hourlyChange;
    this.dailyChange = dailyChange;

    this.min = min;
    this.max = max;
  }

  advanceHour = () => this.changeValue(this.hourlyChange); 

  advanceHour = () => this.changeValue(this.dailyChange);

  advanceHour = () => this.changeValue(this.sleepChange);

  getValue() {
    return this.value;
  }

  changeValue(amount) {
    this.value = MathUtil.clamp(this.value + this.amount, this.min, this.max);
  }

  drawBar(ctx, x, y) {
    const width = 40;
    const height = 8;

    const percent = (this.value - this.min) / (this.max - this.min);
    const fillWidth = percent * width;

    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "blue";
    ctx.fillRect(x, y, fillWidth, height);
  }
}

export { Stat };
