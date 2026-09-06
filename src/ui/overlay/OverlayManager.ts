import type { Application, Container } from "pixi.js";
import { gsap } from "gsap";
import type { Overlay } from "./Overlay";
import type { ResultOverlayMeta } from "./ResultOverlay";

const TRANSITION_DURATION = 0.35;

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

interface OverlayMetaMap {
  [OverlayId.Home]: undefined;
  [OverlayId.Pause]: undefined;
  [OverlayId.EndWon]: ResultOverlayMeta;
  [OverlayId.EndLost]: ResultOverlayMeta;
}

export class OverlayManager {
  private currentOverlay: Overlay | undefined;
  private currentOverlayId: OverlayId | undefined;

  private transitionVersion = 0;
  private _screenWidth = 0;
  private _screenHeight = 0;

  constructor(
    private _app: Application,
    private _parent: Container,
    private _factories: Map<OverlayId, OverlayFactory>,
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

    if (previousOverlay) {
      this._stopTransitionAnimation(previousOverlay);

      if (options?.immediateTransition) {
        previousOverlay.alpha = 0;
      } else if (previousOverlay.animateOut) {
        await previousOverlay.animateOut();
      } else {
        await gsap.to(previousOverlay, {
          alpha: 0,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
          overwrite: true,
        });
      }

      if (version !== this.transitionVersion) {
        return;
      }

      await previousOverlay.onExit?.();

      if (version !== this.transitionVersion) {
        return;
      }

      this._removeOverlay(previousOverlay);
    }

    if (id === null) {
      return;
    }

    const factory = this._factories.get(id);

    if (!factory) {
      throw new Error(`Unknown overlay: ${id}`);
    }

    const overlay = factory();

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
        duration: TRANSITION_DURATION,
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

  public onResize(width: number, height: number) {
    this.currentOverlay?.onResize?.(width, height);
    this._screenWidth = width;
    this._screenHeight = height;
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
