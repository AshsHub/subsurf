import { Container3D, Light, LightingEnvironment } from "pixi3d/pixi7";

import { EntityManager } from "../EntityManager";
import { EntityPool } from "../EntityPool";
import { type KeyboardAction } from "../../input/KeyboardInput";

import { Player } from "./entity/Player";
import { Track } from "./entity/Track";
import { Obstacle } from "./entity/Obstacle";

import { type Lane } from "./configs/LaneConfig";
import { GAME_SPEED } from "./configs/GameConfig";

import { CollisionManager, type CollisionHandler } from "../CollisionManager";

import { CollisionDebugRenderer } from "../debug/CollisionDebugRenderer";

import { SpawnManager } from "../SpawnManager";

import { PATTERNS, SPAWN_CONFIG, type SpawnCell } from "./configs/SpawnConfig";

export class GameWorld extends Container3D {
  private readonly _entityManager = new EntityManager();

  private readonly _collisionManager: CollisionManager;

  private readonly _spawnManager = new SpawnManager(
    PATTERNS,
    SPAWN_CONFIG,
    (type, lane, z) => {
      this._spawn(type, lane, z);
    },
  );

  private readonly _entityPool = new EntityPool();

  private readonly _activeObstacles = new Set<Obstacle>();

  private readonly _collisionDebug: CollisionDebugRenderer;

  private _track!: Track;
  private _player!: Player;

  private _speed = GAME_SPEED.initial;

  constructor(onCollision?: CollisionHandler) {
    super();

    this._collisionManager = new CollisionManager(onCollision);

    this._collisionDebug = new CollisionDebugRenderer(
      this,
      this._collisionManager,
    );
  }

  public get speed(): number {
    return this._speed;
  }

  public init(): void {
    this._entityManager.init(this, this._collisionManager);

    this._registerPools();

    this._track = this._entityManager.add(Track.create());

    this._player = this._entityManager.add(Player.create());

    this.setupLighting();
  }

  public start(): void {
    this._speed = GAME_SPEED.initial;

    this._player.reset();

    this._spawnManager.reset();
    this._spawnManager.start();
  }

  public pause(): void {
    this._spawnManager.stop();
  }

  public resume(): void {
    this._spawnManager.start();
  }

  public gameOver(): void {
    this._spawnManager.stop();
  }

  public reset(): void {
    this._spawnManager.stop();
    this._spawnManager.reset();

    this._speed = GAME_SPEED.initial;

    this._player.reset();

    for (const obstacle of [...this._activeObstacles]) {
      this._despawnObstacle(obstacle);
    }
  }

  public update(deltaTime: number): void {
    this._updateSpeed(deltaTime);

    this._entityManager.update(deltaTime, this._speed);

    this._spawnManager.update(deltaTime, this._speed);

    this._collisionManager.update();

    this._checkObstacles();

    this._collisionDebug.update();
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
        break;
    }
  };

  public destroy(): void {
    this._entityManager.clear();
    this._entityPool.clear();

    super.destroy();
  }

  private _spawn(type: SpawnCell, lane: Lane, z: number): void {
    switch (type) {
      case "o":
        this._spawnObstacle(lane, z);
        break;

      case "p":
        break;

      case "x":
        break;
    }
  }

  private _spawnObstacle(lane: Lane, z: number): void {
    const obstacle = this._entityPool.create<Obstacle>(Obstacle.poolId);

    obstacle.spawn(lane, z);

    this._activeObstacles.add(obstacle);

    this._entityManager.add(obstacle);
  }

  private _updateSpeed(deltaTime: number): void {
    this._speed = Math.min(
      this._speed + GAME_SPEED.acceleration * deltaTime,
      GAME_SPEED.maximum,
    );
  }

  private _registerPools(): void {
    this._entityPool.register(Obstacle.poolId, Obstacle.create, 5);
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
