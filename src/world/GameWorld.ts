import { Container3D } from "pixi3d/pixi7";
import { Track } from "./Track";
import { Player } from "./Player";
import { EntityManager } from "../game/EntityManager";

export class GameWorld extends Container3D {
  private readonly entityManager = new EntityManager();

  private player!: Player;
  private track!: Track;

  init(): void {
    this.addChild(this.entityManager);

    this.track = this.entityManager.add(Track.create());
    this.player = this.entityManager.add(Player.create());
    this.track.position.set(0, 0, -35);
  }

  update(deltaTime: number): void {
    this.entityManager.update(deltaTime);
  }
}
