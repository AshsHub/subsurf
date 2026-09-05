import { POOL_ID } from "../../EntityPool";
import { Obstacle } from "./Obstacle";

export class TallObstacle extends Obstacle {
  readonly poolId = POOL_ID.obstacle;

  static create(): TallObstacle {
    return new TallObstacle(1.7);
  }
}
