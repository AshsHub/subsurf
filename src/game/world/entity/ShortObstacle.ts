import { POOL_ID } from "../../EntityPool";
import { Obstacle } from "./Obstacle";

export class ShortObstacle extends Obstacle {
  readonly poolId = POOL_ID.obstacle_short;

  static create(): ShortObstacle {
    return new ShortObstacle(0.7);
  }
}
