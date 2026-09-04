import { WorldEntity } from "./WorldEntity";

export abstract class DynamicEntity extends WorldEntity {
  protected _shouldUpdate = true;
  abstract override update(deltaTime: number): void;
}
