/**
 * 2D Vector helper class.
 *
 * Supports:
 * - Construction from x/y values, objects, or other vectors
 * - Distance calculations
 * - Position setting from multiple input types
 * - Basic vector math
 * - Method chaining
 */

export interface VectorLike {
  x: number;
  y: number;
}

export class Vector2 {
  public x: number;
  public y: number;

  public constructor();
  public constructor(x: number, y: number);
  public constructor(vector: VectorLike);
  public constructor(xOrVector: number | VectorLike = 0, y: number = 0) {
    if (typeof xOrVector === "number") {
      this.x = xOrVector;
      this.y = y;
    } else {
      this.x = xOrVector.x;
      this.y = xOrVector.y;
    }
  }

  // -------------------------------------------------------------------------
  // Creation
  // -------------------------------------------------------------------------

  public static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  public static one(): Vector2 {
    return new Vector2(1, 1);
  }

  public static from(vector: VectorLike): Vector2 {
    return new Vector2(vector);
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public copy(): Vector2 {
    return this.clone();
  }

  // -------------------------------------------------------------------------
  // Position
  // -------------------------------------------------------------------------

  public set(x: number, y: number): this;
  public set(vector: VectorLike): this;
  public set(xOrVector: number | VectorLike, y?: number): this {
    if (typeof xOrVector === "number") {
      this.x = xOrVector;
      this.y = y ?? this.y;
    } else {
      this.x = xOrVector.x;
      this.y = xOrVector.y;
    }

    return this;
  }

  public setX(x: number): this {
    this.x = x;
    return this;
  }

  public setY(y: number): this {
    this.y = y;
    return this;
  }

  // -------------------------------------------------------------------------
  // Math
  // -------------------------------------------------------------------------

  public add(x: number, y: number): this;
  public add(vector: VectorLike): this;
  public add(xOrVector: number | VectorLike, y?: number): this {
    if (typeof xOrVector === "number") {
      this.x += xOrVector;
      this.y += y ?? 0;
    } else {
      this.x += xOrVector.x;
      this.y += xOrVector.y;
    }

    return this;
  }

  public subtract(x: number, y: number): this;
  public subtract(vector: VectorLike): this;
  public subtract(xOrVector: number | VectorLike, y?: number): this {
    if (typeof xOrVector === "number") {
      this.x -= xOrVector;
      this.y -= y ?? 0;
    } else {
      this.x -= xOrVector.x;
      this.y -= xOrVector.y;
    }

    return this;
  }

  public multiply(value: number): this;
  public multiply(vector: VectorLike): this;
  public multiply(valueOrVector: number | VectorLike): this {
    if (typeof valueOrVector === "number") {
      this.x *= valueOrVector;
      this.y *= valueOrVector;
    } else {
      this.x *= valueOrVector.x;
      this.y *= valueOrVector.y;
    }

    return this;
  }

  public divide(value: number): this;
  public divide(vector: VectorLike): this;
  public divide(valueOrVector: number | VectorLike): this {
    if (typeof valueOrVector === "number") {
      this.x /= valueOrVector;
      this.y /= valueOrVector;
    } else {
      this.x /= valueOrVector.x;
      this.y /= valueOrVector.y;
    }

    return this;
  }

  public negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  // -------------------------------------------------------------------------
  // Distance
  // -------------------------------------------------------------------------

  public distanceTo(x: number, y: number): number;
  public distanceTo(vector: VectorLike): number;
  public distanceTo(xOrVector: number | VectorLike, y?: number): number {
    const targetX = typeof xOrVector === "number" ? xOrVector : xOrVector.x;

    const targetY = typeof xOrVector === "number" ? (y ?? 0) : xOrVector.y;

    const dx = targetX - this.x;
    const dy = targetY - this.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  public distanceSquaredTo(x: number, y: number): number;
  public distanceSquaredTo(vector: VectorLike): number;
  public distanceSquaredTo(xOrVector: number | VectorLike, y?: number): number {
    const targetX = typeof xOrVector === "number" ? xOrVector : xOrVector.x;

    const targetY = typeof xOrVector === "number" ? (y ?? 0) : xOrVector.y;

    const dx = targetX - this.x;
    const dy = targetY - this.y;

    return dx * dx + dy * dy;
  }

  public static distance(a: VectorLike, b: VectorLike): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  public static distanceSquared(a: VectorLike, b: VectorLike): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    return dx * dx + dy * dy;
  }

  // -------------------------------------------------------------------------
  // Magnitude
  // -------------------------------------------------------------------------

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  public normalize(): this {
    const len = this.length();

    if (len !== 0) {
      this.x /= len;
      this.y /= len;
    }

    return this;
  }

  public clampLength(maxLength: number): this {
    if (maxLength <= 0) {
      return this.clear();
    }

    const len = this.length();

    if (len > maxLength && len !== 0) {
      this.multiply(maxLength / len);
    }

    return this;
  }

  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------

  public dot(vector: VectorLike): number {
    return this.x * vector.x + this.y * vector.y;
  }

  // 2D cross product magnitude
  public cross(vector: VectorLike): number {
    return this.x * vector.y - this.y * vector.x;
  }

  // -------------------------------------------------------------------------
  // Utility
  // -------------------------------------------------------------------------

  public equals(vector: VectorLike): boolean {
    return this.x === vector.x && this.y === vector.y;
  }

  public lerp(target: VectorLike, alpha: number): this {
    this.x += (target.x - this.x) * alpha;
    this.y += (target.y - this.y) * alpha;

    return this;
  }

  public floor(): this {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  public ceil(): this {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  public round(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  public clear(): this {
    this.x = 0;
    this.y = 0;
    return this;
  }

  public toObject(): VectorLike {
    return {
      x: this.x,
      y: this.y,
    };
  }

  public toArray(): [number, number] {
    return [this.x, this.y];
  }

  public toString(): string {
    return `Vector2(${this.x}, ${this.y})`;
  }
}
