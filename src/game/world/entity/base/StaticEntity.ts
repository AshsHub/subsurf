import type { POOL_ID } from "../../../EntityPool";
import { WorldEntity } from "./WorldEntity";

export abstract class StaticEntity extends WorldEntity {
  public poolId: POOL_ID | null = null;
  override update(_deltaTime: number, _speed: number): void {}
}
