import type { Application, Container } from "pixi.js";
import { gsap } from "gsap";
import type { Overlay } from "./Overlay";

const TRANSITION_DURATION = 0.35;

export type OverlayId = "home" | "pause";

export interface OverlayTransitionOptions {
  immediate?: boolean;
}

export type OverlayFactory = () => Overlay;

export class OverlayManager {
  private readonly app: Application;
  private readonly parent: Container;
  private readonly factories: Map<OverlayId, OverlayFactory>;

  private currentOverlay: Overlay | undefined;
  private currentOverlayId: OverlayId | undefined;

  private transitionVersion = 0;

  constructor(
    app: Application,
    parent: Container,
    factories: Record<OverlayId, OverlayFactory>,
  ) {
    this.app = app;
    this.parent = parent;

    this.factories = new Map(
      Object.entries(factories) as [OverlayId, OverlayFactory][],
    );
  }

  public get current(): OverlayId | undefined {
    return this.currentOverlayId;
  }

  public async goTo(
    id: OverlayId | null,
    options: OverlayTransitionOptions = {},
  ): Promise<void> {
    const version = ++this.transitionVersion;

    const previousOverlay = this.currentOverlay;
    const previousOverlayId = this.currentOverlayId;

    if (id === previousOverlayId) {
      return;
    }

    if (previousOverlay) {
      this._stopTransitionAnimation(previousOverlay);

      if (options.immediate) {
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

    const factory = this.factories.get(id);

    if (!factory) {
      throw new Error(`Unknown overlay: ${id}`);
    }

    const overlay = factory();

    this.currentOverlay = overlay;
    this.currentOverlayId = id;

    overlay.alpha = options.immediate ? 1 : 0;

    this.parent.addChild(overlay);

    overlay.onResize?.(this.app.screen.width, this.app.screen.height);

    await overlay.onEnter?.(this.app);

    if (version !== this.transitionVersion) {
      this._removeOverlay(overlay);
      return;
    }

    if (options.immediate) {
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

  public handleResize(width: number, height: number): void {
    this.currentOverlay?.onResize?.(width, height);
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
    if (overlay.parent === this.parent) {
      this.parent.removeChild(overlay);
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
