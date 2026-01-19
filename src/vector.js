class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) { return new Vector2(this.x + v.x, this.y + v.y); }

  subtract(v) { return new Vector2(this.x - v.x, this.y - v.y); }

  multiply(scalar) { return new Vector2(this.x * scalar, this.y * scalar); }

  divide(scalar) {
    if (scalar === 0) {
      throw new Error("Division by zero");
    }
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector2(0, 0);
    }
    return this.divide(mag);
  }

  dot(v) { return this.x * v.x + this.y * v.y; }

  toString() { return `Vector2(${this.x}, ${this.y})`; }
}

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(v) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }

  subtract(v) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }

  multiply(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  divide(scalar) {
    if (scalar === 0) {
      throw new Error("Division by zero");
    }
    return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector3(0, 0, 0);
    }
    return this.divide(mag);
  }

  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }

  toString() { return `Vector3(${this.x}, ${this.y}, ${this.z})`; }
}

export {Vector2, Vector3};
