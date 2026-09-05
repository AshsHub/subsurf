import { Assets } from "pixi.js";
import {
  Color,
  Container3D,
  Cubemap,
  Fog,
  Light,
  LightingEnvironment,
  LightType,
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
    const environment = LightingEnvironment.main;

    // --------------------------------------------------
    // Player key
    // --------------------------------------------------

    const playerKey = new Light();

    playerKey.type = LightType.point;
    playerKey.position.set(0, 3.5, -2.5);
    playerKey.intensity = 45;
    playerKey.range = 8;

    playerKey.color.r = 1;
    playerKey.color.g = 0.95;
    playerKey.color.b = 0.9;

    // --------------------------------------------------
    // Player fill
    // --------------------------------------------------

    const playerFill = new Light();

    playerFill.type = LightType.point;
    playerFill.position.set(-3, 2.5, 1);
    playerFill.intensity = 18;
    playerFill.range = 7;

    playerFill.color.r = 0.65;
    playerFill.color.g = 0.8;
    playerFill.color.b = 1;

    // --------------------------------------------------
    // Road light
    //
    // Gives visibility further down the road without
    // illuminating the entire track.
    // --------------------------------------------------

    const roadLight = new Light();

    roadLight.type = LightType.point;
    roadLight.position.set(0, 4, -12);
    roadLight.intensity = 20;
    roadLight.range = 25;

    roadLight.color.r = 0.75;
    roadLight.color.g = 0.8;
    roadLight.color.b = 0.9;

    environment.lights.push(playerKey, playerFill, roadLight);
  }
}
