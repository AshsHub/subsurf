import { WorldEntity } from "./WorldEntity";

export abstract class DynamicEntity extends WorldEntity {
  protected _shouldUpdate = true;
  abstract override update(_deltaTime: number, _speed: number): void;
}
