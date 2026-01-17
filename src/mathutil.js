class MathUtil {
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static chance(percent) {
    return Math.random() * 100 < percent;
  }
}

export { MathUtil };
