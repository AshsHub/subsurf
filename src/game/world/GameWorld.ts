import {
  Container3D,
  Cubemap,
  Light,
  LightingEnvironment,
  Skybox,
} from "pixi3d/pixi7";
import { Assets } from "pixi.js";

import { type KeyboardAction } from "../../input/KeyboardInput";
import { CollisionManager, type CollisionHandler } from "../CollisionManager";
import { CollisionDebugRenderer } from "../debug/CollisionDebugRenderer";
import { EntityManager } from "../EntityManager";
import { POOL_ID } from "../EntityPool";
import { SpawnManager } from "../SpawnManager";
import { GAME_SPEED } from "./configs/GameConfig";
import { type Lane } from "./configs/LaneConfig";
import { PATTERNS, SPAWN_CONFIG, type SpawnCell } from "./configs/SpawnConfig";
import type { WorldEntity } from "./entity/base/WorldEntity";
import { Player } from "./entity/Player";
import { Track } from "./entity/Track";

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

  private readonly _collisionDebug: CollisionDebugRenderer;

  private _track!: Track;
  private _player!: Player;

  private _speed = GAME_SPEED.initial;
  private _collectionCount = 0;

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

  public get collectionCount(): number {
    return this._collectionCount;
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
    this._collectionCount = 0;

    this._player.reset();
    this._entityManager.reset();
    this._spawnManager.reset();

    this._spawnManager.start();
  }

  public pause(): void {
    this._spawnManager.pause();
  }

  public resume(): void {
    this._spawnManager.resume();
  }

  public end(): void {
    this._spawnManager.end();
  }

  public reset(): void {
    this._spawnManager.reset();

    this._speed = GAME_SPEED.initial;
    this._collectionCount = 0;

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
    super.destroy();
  }

  private _spawn(type: SpawnCell, lane: Lane, z: number): void {
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
