import { Assets } from "pixi.js";
import {
  Container3D,
  Cubemap,
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
import { PATTERNS, SPAWN_CONFIG } from "./configs/SpawnConfig";
import type { Collectible } from "./entity/Collectible";
import { Obstacle } from "./entity/Obstacle";
import { Player } from "./entity/Player";
import { Track } from "./entity/Track";
import { GameplayCamera } from "./CameraController";
import { SoundId, type SoundController } from "../SoundController";

export class GameWorld extends Container3D {
  public onHitObstacle: Subject<void> = new Subject<void>();
  public onScored: Subject<void> = new Subject<void>();

  private readonly _entityManager = new EntityManager();
  private readonly _collisionManager: CollisionManager;
  private readonly _spawnManager = new SpawnManager(PATTERNS, SPAWN_CONFIG);

  private readonly _collisionDebug: CollisionDebugRenderer;

  private _track!: Track;
  private _player!: Player;
  private _camera!: GameplayCamera;

  private _speed = GAME_SPEED.initial;
  private _incrementSpeed = true;
  private _consecutiveTallObstacles = 0;
  private _soundController: SoundController;

  constructor(soundController: SoundController) {
    super();

    this._soundController = soundController;

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

    this._camera = new GameplayCamera(this._player);

    await this.setupSkybox();
    this.setupLighting();
  }

  public start(): void {
    this._speed = GAME_SPEED.initial;
    this._player.reset();
    this._camera.reset();
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
    this._incrementSpeed = true;
  }

  public update(deltaTime: number): void {
    this._updateSpeed(deltaTime);
    this._entityManager.update(deltaTime, this._speed);
    this._spawnManager.update(deltaTime, this._speed);
    this._collisionManager.update();
    this._collisionDebug.update();
    this._camera.update(deltaTime);
  }

  public onKeyboardAction(action: KeyboardAction): void {
    switch (action) {
      case KeyboardAction.MoveLeft:
        const movedLeft = this._player.moveLeft();

        if (movedLeft) {
          this._soundController.playSfx(SoundId.Move, true);
        }
        break;
      case KeyboardAction.MoveRight:
        const movedRight = this._player.moveRight();

        if (movedRight) {
          this._soundController.playSfx(SoundId.Move, true);
        }
        break;
      case KeyboardAction.Jump:
        const jumped = this._player.jump();

        if (jumped) {
          this._soundController.playSfx(SoundId.Jump, true);
        }
        break;
    }
  }

  public destroy(): void {
    this._entityManager.clear();
    super.destroy();
  }

  private _handleCollision(collision: CollisionResult): void {
    const { player, collider } = collision;
    collider.enabled = false;
    switch (collider.layer) {
      case CollisionLayer.Collectible:
        this.onScored.next();
        this._soundController.playSfx(SoundId.Collect);
        (collider.entity as Collectible).collect(() => {
          this._entityManager.remove(collider.entity);
        });
        break;
      case CollisionLayer.Obstacle:
        if (collision.side !== CollisionSide.Back) {
          this._reduceSpeed(GAME_SPEED.sideCollisionPenalty);
          (player.entity as Player).collide(true);
          this._soundController.playSfx(SoundId.Hit, true);
        } else {
          this._soundController.playSfx(SoundId.Crash);
          this._haltSpeed();
          (player.entity as Player).collide(false, () => {
            this.onHitObstacle.next();
          });
        }
    }
  }

  private _spawn(spawnData: SpawnData): void {
    const { type, lane, z } = spawnData;

    if (type === "x") {
      return;
    }

    if (type === "c") {
      const collectible = this._entityManager.create<Collectible>(
        POOL_ID.collectible,
      );

      collectible.spawn(lane, z);
      this._entityManager.add(collectible, true);

      this._consecutiveTallObstacles = 0;

      return;
    }

    const useTall = this._consecutiveTallObstacles < 2 && Math.random() < 0.5;
    const poolId = useTall ? POOL_ID.obstacle : POOL_ID.obstacle_short;
    const obstacle = this._entityManager.create<Obstacle>(poolId);

    obstacle.spawn(lane, z);
    this._entityManager.add(obstacle, true);

    if (useTall) {
      this._consecutiveTallObstacles++;
    } else {
      this._consecutiveTallObstacles = 0;
    }
  }

  private _updateSpeed(deltaTime: number): void {
    if (!this._incrementSpeed) return;

    this._speed = Math.min(
      this._speed + GAME_SPEED.acceleration * deltaTime,
      GAME_SPEED.maximum,
    );
  }

  private _haltSpeed(): void {
    this._speed = 0;
    this._incrementSpeed = false;
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

    const playerKey = new Light();

    playerKey.type = LightType.point;
    playerKey.position.set(0, 3.5, -2.5);
    playerKey.intensity = 45;
    playerKey.range = 8;

    playerKey.color.r = 1;
    playerKey.color.g = 0.95;
    playerKey.color.b = 0.9;

    const playerFill = new Light();

    playerFill.type = LightType.point;
    playerFill.position.set(0, 10, 5);
    playerFill.intensity = 1000;
    playerFill.range = 35;

    playerFill.color.r = 0.65;
    playerFill.color.g = 0.8;
    playerFill.color.b = 1;

    environment.lights.push(playerKey, playerFill);
  }
}
