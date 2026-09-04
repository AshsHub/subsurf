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

  public goTo(
    id: OverlayId | null,
    options: OverlayTransitionOptions = {},
  ): Promise<void> {
    const version = ++this.transitionVersion;

    if (id === this.currentOverlayId) {
      if (this.currentOverlay) {
        this._killAnimations(this.currentOverlay);

        if (options.immediate) {
          this.currentOverlay.alpha = 1;
        } else {
          gsap.to(this.currentOverlay, {
            alpha: 1,
            duration: TRANSITION_DURATION,
            ease: "power2.out",
            overwrite: true,
          });
        }
      }

      return Promise.resolve();
    }

    const previousOverlay = this.currentOverlay;

    if (previousOverlay) {
      this._killAnimations(previousOverlay);

      if (options.immediate) {
        previousOverlay.alpha = 0;

        this._removeOverlay(previousOverlay);
      } else {
        gsap.to(previousOverlay, {
          alpha: 0,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => {
            if (version !== this.transitionVersion) {
              return;
            }

            if (this.currentOverlay !== previousOverlay) {
              return;
            }

            this._removeOverlay(previousOverlay);
          },
        });
      }
    }

    if (id === null) {
      /*
       * Keep currentOverlay/currentOverlayId alive until the
       * fade-out completes. This is important because a new
       * pause request during the fade-out can reverse it.
       */
      return Promise.resolve();
    }

    const factory = this.factories.get(id);

    if (!factory) {
      throw new Error(`Unknown overlay: ${id}`);
    }

    /*
     * If an old overlay is still fading out, remove it immediately
     * before creating the replacement.
     */
    if (previousOverlay) {
      this._removeOverlay(previousOverlay);
    }

    const overlay = factory();

    this.currentOverlay = overlay;
    this.currentOverlayId = id;

    overlay.alpha = options.immediate ? 1 : 0;

    this.parent.addChild(overlay);

    overlay.onResize?.(this.app.screen.width, this.app.screen.height);

    void overlay.onEnter?.(this.app);

    if (!options.immediate) {
      gsap.to(overlay, {
        alpha: 1,
        duration: TRANSITION_DURATION,
        ease: "power2.out",
        overwrite: true,
      });
    }

    return Promise.resolve();
  }

  public handleResize(width: number, height: number): void {
    this.currentOverlay?.onResize?.(width, height);
  }

  public destroy(): void {
    ++this.transitionVersion;

    if (this.currentOverlay) {
      this._killAnimations(this.currentOverlay);
      this._removeOverlay(this.currentOverlay);
    }

    this.currentOverlay = undefined;
    this.currentOverlayId = undefined;
  }

  private _removeOverlay(overlay: Overlay): void {
    this._killAnimations(overlay);

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

  private _killAnimations(object: Overlay): void {
    gsap.killTweensOf(object);

    for (const child of object.children) {
      this._killAnimationsRecursive(child);
    }
  }

  private _killAnimationsRecursive(
    object: import("pixi.js").DisplayObject,
  ): void {
    gsap.killTweensOf(object);

    if ("children" in object) {
      const children = (object as import("pixi.js").Container).children;

      for (const child of children) {
        this._killAnimationsRecursive(child);
      }
    }
  }
}
