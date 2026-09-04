import { Container3D, Light, LightingEnvironment } from "pixi3d/pixi7";
import { EntityManager } from "../game/EntityManager";
import { type KeyboardAction } from "../input/KeyboardInput";
import { Player } from "./Player";
import { Track } from "./Track";

export class GameWorld extends Container3D {
  private readonly entityManager = new EntityManager();
  private track!: Track;
  private player!: Player;

  public init() {
    this.track = Track.create();
    this.player = Player.create();

    this.addChild(this.entityManager);

    this.entityManager.add(this.track);
    this.entityManager.add(this.player);

    this.setupLighting();
  }

  public update(deltaTime: number): void {
    this.entityManager.update(deltaTime);
  }

  destroy(): void {
    this.entityManager.clear();

    super.destroy();
  }

  public readonly onKeyboardAction = (action: KeyboardAction): void => {
    switch (action) {
      case "left":
        this.player.moveLeft();
        break;
      case "right":
        this.player.moveRight();
        break;
      case "jump":
        this.player.jump();
        break;
    }
  };

  private setupLighting(): void {
    const light = new Light();

    light.position.set(-1, 2, 3);
    light.color.r = 1;
    light.color.g = 1;
    light.color.b = 1;

    LightingEnvironment.main.lights.push(light);
  }
}
