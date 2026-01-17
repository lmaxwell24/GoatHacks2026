import {MathUtil} from "./mathutil";

class Stat {
  constructor(initialValue, change, changeMode) {
    this.value = initialValue;
    this.change = change;
    this.changeMode = changeMode;

    this.max = 100;
    this.min = 0;
  }

  hourChange() {
    if (changeMode == ChangeMode.HOURLY) {
      value += change;
    }
  }

  dayChange() {
    if (changeMode == ChangeMode.DAILY) {
      value += change;
    }
  }

  getValue() {
    return value;
  }

  changeValue(amount) {
    value = MathUtil.clamp(value + amount, min, max);
  }
}

const ChangeMode = Object.freeze({
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
  MANUAL: 'MANUAL'
})

export { Stat };
