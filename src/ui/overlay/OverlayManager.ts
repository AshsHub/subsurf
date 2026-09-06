import type { Application, Container } from "pixi.js";
import { gsap } from "gsap";
import type { Overlay } from "./Overlay";
import type { ResultOverlayMeta } from "./ResultOverlay";

export enum OverlayId {
  Home,
  Pause,
  EndWon,
  EndLost,
}

export type OverlayOptions<TMeta = undefined> = {
  immediateTransition?: boolean;
  meta?: TMeta;
};

export type OverlayFactory = () => Overlay;

export type OverlayRegistration = {
  factory: OverlayFactory;
  priority?: number;
};

interface OverlayMetaMap {
  [OverlayId.Home]: undefined;
  [OverlayId.Pause]: undefined;
  [OverlayId.EndWon]: ResultOverlayMeta;
  [OverlayId.EndLost]: ResultOverlayMeta;
}

export class OverlayManager {
  public static CONFIG = {
    transitionDuration: 0.35,
  };
  private currentOverlay: Overlay | undefined;
  private currentOverlayId: OverlayId | undefined;

  private transitionVersion = 0;
  private _screenWidth = 0;
  private _screenHeight = 0;

  constructor(
    private _app: Application,
    private _parent: Container,
    private _factories: Map<OverlayId, OverlayRegistration>,
  ) {}

  public get current(): OverlayId | undefined {
    return this.currentOverlayId;
  }

  public async goTo<TId extends OverlayId>(
    id: TId | null,
    options?: OverlayOptions<OverlayMetaMap[TId]>,
  ): Promise<void> {
    const version = ++this.transitionVersion;

    const previousOverlay = this.currentOverlay;
    const previousOverlayId = this.currentOverlayId;

    if (id === previousOverlayId) {
      return;
    }

    const registration = id === null ? undefined : this._factories.get(id);

    if (id !== null && !registration) {
      throw new Error(`Unknown overlay: ${id}`);
    }

    if (previousOverlay) {
      const previousPriority =
        previousOverlayId === undefined
          ? 0
          : this._getPriority(previousOverlayId);

      const nextPriority = id === null ? 0 : (registration?.priority ?? 0);

      const shouldInterrupt = nextPriority > previousPriority;
      const shouldSkipAnimation =
        options?.immediateTransition || shouldInterrupt;

      if (shouldSkipAnimation) {
        this._stopTransitionAnimation(previousOverlay);
        previousOverlay.alpha = 0;
        this._removeOverlay(previousOverlay);
      } else if (previousOverlay.animateOut) {
        await previousOverlay.animateOut();
      } else {
        await gsap.to(previousOverlay, {
          alpha: 0,
          duration: OverlayManager.CONFIG.transitionDuration,
          ease: "power2.inOut",
          overwrite: true,
        });
      }

      if (version !== this.transitionVersion) {
        return;
      }

      if (this.currentOverlay === previousOverlay) {
        await previousOverlay.onExit?.();

        if (version !== this.transitionVersion) {
          return;
        }

        this._removeOverlay(previousOverlay);
      }
    }

    if (id === null || !registration) {
      return;
    }

    const overlay = registration.factory();

    this.currentOverlay = overlay;
    this.currentOverlayId = id;

    overlay.alpha = options?.immediateTransition ? 1 : 0;

    this._parent.addChild(overlay);

    await overlay.onEnter?.(this._app, options?.meta);
    await overlay.onResize?.(this._screenWidth, this._screenHeight);

    if (version !== this.transitionVersion) {
      this._removeOverlay(overlay);
      return;
    }

    if (options?.immediateTransition) {
      overlay.alpha = 1;
      return;
    }

    if (overlay.animateIn) {
      await overlay.animateIn();
    } else {
      await gsap.to(overlay, {
        alpha: 1,
        duration: OverlayManager.CONFIG.transitionDuration,
        ease: "power2.out",
        overwrite: true,
      });
    }
  }

  public destroy(): void {
    ++this.transitionVersion;

    if (this.currentOverlay) {
      this._stopTransitionAnimation(this.currentOverlay);
      this._removeOverlay(this.currentOverlay);
    }

    this.currentOverlay = undefined;
    this.currentOverlayId = undefined;
  }

  public onResize(width: number, height: number): void {
    this._screenWidth = width;
    this._screenHeight = height;

    this.currentOverlay?.onResize?.(width, height);
  }

  private _getPriority(id: OverlayId): number {
    return this._factories.get(id)?.priority ?? 0;
  }

  private _stopTransitionAnimation(overlay: Overlay): void {
    gsap.killTweensOf(overlay);

    if ("children" in overlay) {
      this._killChildAnimations(overlay as Container);
    }
  }

  private _killChildAnimations(container: Container): void {
    for (const child of container.children) {
      gsap.killTweensOf(child);

      if ("children" in child) {
        this._killChildAnimations(child as Container);
      }
    }
  }

  private _removeOverlay(overlay: Overlay): void {
    if (overlay.parent === this._parent) {
      this._parent.removeChild(overlay);
    }

    if (this.currentOverlay === overlay) {
      this.currentOverlay = undefined;
      this.currentOverlayId = undefined;
    }

    overlay.destroy({
      children: true,
    });
  }
}
