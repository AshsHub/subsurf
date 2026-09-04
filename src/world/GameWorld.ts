import { Container3D, Light, LightingEnvironment } from "pixi3d/pixi7";
import { EntityManager } from "../game/EntityManager";
import { EntityPool } from "../game/EntityPool";
import { type KeyboardAction } from "../input/KeyboardInput";
import { Player } from "./entity/Player";
import { Track } from "./entity/Track";
import { Obstacle } from "./entity/Obstacle";
import { type Lane } from "./configs/LaneConfig";
import { GAME_SPEED } from "./configs/GameConfig";

export class GameWorld extends Container3D {
  private readonly _entityManager = new EntityManager();
  private readonly _entityPool = new EntityPool();

  private readonly _activeObstacles = new Set<Obstacle>();

  private _track!: Track;
  private _player!: Player;
  private _speed = GAME_SPEED.initial;

  public get speed(): number {
    return this._speed;
  }

  public init(): void {
    this._entityManager.init(this);

    this._registerPools();

    this._track = this._entityManager.add(Track.create());
    this._player = this._entityManager.add(Player.create());

    this.setupLighting();
  }

  public update(deltaTime: number): void {
    this._entityManager.update(deltaTime, this.speed);
    this._checkObstacles();
  }

  public readonly onKeyboardAction = (action: KeyboardAction): void => {
    switch (action) {
      case "left":
        this._player.moveLeft();
        break;

      case "right":
        this._player.moveRight();
        break;

      case "jump":
        this._player.jump();
        this._spawnObstacle(-10);
        break;
    }
  };

  public destroy(): void {
    this._entityManager.clear();
    this._entityPool.clear();

    super.destroy();
  }

  // TODO: Utilise to increase speed over time
  private _updateSpeed(deltaTime: number): void {
    this._speed = Math.min(
      this._speed + GAME_SPEED.acceleration * deltaTime,
      GAME_SPEED.maximum,
    );
  }

  private _registerPools(): void {
    this._entityPool.register(Obstacle.poolId, Obstacle.create, 5);
  }

  // TODO: Move to a proper spawning engine
  private _spawnObstacle(z: number): void {
    const obstacle = this._entityPool.create<Obstacle>(Obstacle.poolId);

    const lane = Math.floor(Math.random() * 3) as Lane;

    obstacle.spawn(lane, z);

    this._activeObstacles.add(obstacle);

    this._entityManager.add(obstacle);
  }

  private _checkObstacles(): void {
    for (const obstacle of this._activeObstacles) {
      if (obstacle.position.z > 5) {
        this._despawnObstacle(obstacle);
      }
    }
  }

  private _despawnObstacle(obstacle: Obstacle): void {
    this._activeObstacles.delete(obstacle);

    this._entityManager.remove(obstacle);

    this._entityPool.release(Obstacle.poolId, obstacle);
  }

  private setupLighting(): void {
    const light = new Light();

    light.position.set(-1, 2, 3);

    light.color.r = 1;
    light.color.g = 1;
    light.color.b = 1;

    LightingEnvironment.main.lights.push(light);
  }
}
