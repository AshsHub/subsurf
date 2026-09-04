import { WorldEntity } from "./WorldEntity";

export abstract class StaticEntity extends WorldEntity {
  override update(_deltaTime: number): void {}
}
