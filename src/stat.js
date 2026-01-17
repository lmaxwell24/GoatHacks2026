import { MathUtil } from "./mathutil";

class Stat {
  constructor(initialValue = 100, hourlyChange = 0, dailyChange = 0, sleepChange = 0, min = 0, max = 100) {
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
    return value;
  }

  changeValue(amount) {
    value = MathUtil.clamp(value + amount, min, max);
  }
}

export { Stat };
