import { Assets } from "pixi.js";
import {
  Container3D,
  Cubemap,
  Light,
  LightingEnvironment,
  Skybox,
} from "pixi3d/pixi7";

import { Subject } from "rxjs";
import { KeyboardAction } from "../../input/KeyboardInput";
import {
  CollisionManager,
  CollisionSide,
  type CollisionResult,
} from "../CollisionManager";
import { CollisionDebugRenderer } from "../debug/CollisionDebugRenderer";
import { EntityManager } from "../EntityManager";
import { POOL_ID } from "../EntityPool";
import { SpawnManager, type SpawnData } from "../SpawnManager";
import { CollisionLayer } from "./component/Collider";
import { GAME_SPEED } from "./configs/GameConfig";
import { type Lane } from "./configs/LaneConfig";
import { PATTERNS, SPAWN_CONFIG, type SpawnCell } from "./configs/SpawnConfig";
import type { WorldEntity } from "./entity/base/WorldEntity";
import { Player } from "./entity/Player";
import { Track } from "./entity/Track";

export class GameWorld extends Container3D {
  public onHitObstacle: Subject<void> = new Subject<void>();
  public onScored: Subject<void> = new Subject<void>();

  private readonly _entityManager = new EntityManager();
  private readonly _collisionManager: CollisionManager;
  private readonly _spawnManager = new SpawnManager(PATTERNS, SPAWN_CONFIG);

  private readonly _collisionDebug: CollisionDebugRenderer;

  private _track!: Track;
  private _player!: Player;

  private _speed = GAME_SPEED.initial;

  constructor() {
    super();

    this._collisionManager = new CollisionManager((collision) => {
      this._handleCollision(collision);
    });
    this._collisionDebug = new CollisionDebugRenderer(
      this,
      this._collisionManager,
    );

    this._spawnManager.onSpawn.subscribe((spawnData) => {
      this._spawn(spawnData);
    });
  }

  public get speed(): number {
    return this._speed;
  }

  public async init(): Promise<void> {
    this._entityManager.init(this, this._collisionManager);

    this._track = this._entityManager.add(Track.create());
    this._player = this._entityManager.add(Player.create());

    await this.setupSkybox();
    this.setupLighting();
  }

  public start(): void {
    this._speed = GAME_SPEED.initial;
    this._player.reset();
    this._entityManager.reset();
    this._spawnManager.reset();
    this._spawnManager.start();
  }

  public pause(): void {
    this._spawnManager.pause();
    this._entityManager.pause();
  }

  public resume(): void {
    this._spawnManager.resume();
    this._entityManager.resume();
  }

  public end(): void {
    this._spawnManager.end();
  }

  public reset(): void {
    this._spawnManager.reset();
    this._speed = GAME_SPEED.initial;
    this._player.reset();
    this._entityManager.reset();
  }

  public update(deltaTime: number): void {
    this._updateSpeed(deltaTime);
    this._entityManager.update(deltaTime, this._speed);
    this._spawnManager.update(deltaTime, this._speed);
    this._collisionManager.update();
    this._collisionDebug.update();
  }

  public onKeyboardAction(action: KeyboardAction): void {
    switch (action) {
      case KeyboardAction.MoveLeft:
        this._player.moveLeft();
        break;
      case KeyboardAction.MoveRight:
        this._player.moveRight();
        break;
      case KeyboardAction.Jump:
        this._player.jump();
        break;
    }
  }

  public destroy(): void {
    this._entityManager.clear();
    super.destroy();
  }

  private _handleCollision(collision: CollisionResult): void {
    switch (collision.collider.layer) {
      case CollisionLayer.Collectible:
        this.onScored.next();
        this._entityManager.remove(collision.collider.entity);
        break;
      case CollisionLayer.Obstacle:
        if (collision.side !== CollisionSide.Back) {
          collision.collider.enabled = false;
          this._reduceSpeed(GAME_SPEED.sideCollisionPenalty);
        } else {
          this.onHitObstacle.next();
        }
    }
  }

  private _spawn(spawnData: SpawnData): void {
    const { type, lane, z } = spawnData;

    if (type === "x") {
      return;
    }

    const poolId = type === "o" ? POOL_ID.obstacle : POOL_ID.collectible;
    const spawnedEntity: WorldEntity = this._entityManager.create(poolId);
    spawnedEntity.spawn(lane, z);
    this._entityManager.add(spawnedEntity, true);
  }

  private _updateSpeed(deltaTime: number): void {
    this._speed = Math.min(
      this._speed + GAME_SPEED.acceleration * deltaTime,
      GAME_SPEED.maximum,
    );
  }

  private _reduceSpeed(amount: number): void {
    this._speed = Math.min(
      Math.max(this._speed - amount, GAME_SPEED.initial),
      GAME_SPEED.maximum,
    );
  }

  private async setupSkybox(): Promise<void> {
    const cubemap = Cubemap.fromFaces({
      posx: Assets.get("right"),
      negx: Assets.get("left"),
      posy: Assets.get("top"),
      negy: Assets.get("bottom"),
      posz: Assets.get("front"),
      negz: Assets.get("back"),
    });

    this.addChild(new Skybox(cubemap));
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
