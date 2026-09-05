import type { POOL_ID } from "../../../EntityPool";
import { WorldEntity } from "./WorldEntity";

export abstract class DynamicEntity extends WorldEntity {
  public poolId: POOL_ID | null = null;
  protected _shouldUpdate = true;
  abstract override update(_deltaTime: number, _speed: number): void;
}
