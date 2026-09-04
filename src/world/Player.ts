import { Mesh3D } from "pixi3d/pixi7";
import { DynamicEntity } from "./entity/DynamicEntity";

export class Player extends DynamicEntity {
  readonly body: Mesh3D;
  readonly head: Mesh3D;

  static create(): Player {
    return new Player();
  }

  constructor() {
    super();

    this.body = Mesh3D.createCube();
    this.body.scale.set(0.7, 1, 0.5);
    this.body.position.set(0, 0.6, 0);

    this.head = Mesh3D.createCube();
    this.head.scale.set(0.5, 0.5, 0.5);
    this.head.position.set(0, 1.35, 0);

    this.visual.addChild(this.body, this.head);
  }

  update(deltaTime: number): void {
    // player behaviour
  }
}
