import type { Application, Container } from "pixi.js";
import { gsap } from "gsap";
import type { Overlay } from "./Overlay";

const TRANSITION_DURATION = 0.35;

export type OverlayId = "home";

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

  private transition: Promise<void> = Promise.resolve();

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

    window.addEventListener("resize", this.handleResize);
  }

  get current(): OverlayId | undefined {
    return this.currentOverlayId;
  }

  async goTo(id: OverlayId | null, options: OverlayTransitionOptions = {}) {
    this.transition = this.transition.then(() =>
      this.performTransition(id, options),
    );
    return this.transition;
  }

  private async performTransition(
    id: OverlayId | null,
    options: OverlayTransitionOptions,
  ) {
    if (id === this.currentOverlayId) {
      return;
    }

    const previousOverlay = this.currentOverlay;

    // Hide current overlay

    if (previousOverlay) {
      if (options.immediate) {
        previousOverlay.alpha = 0;
      } else if (previousOverlay.animateOut) {
        await previousOverlay.animateOut();
      } else {
        await gsap.to(previousOverlay, {
          alpha: 0,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
        });
      }

      await previousOverlay.onExit?.();

      this.parent.removeChild(previousOverlay);
      previousOverlay.destroy({
        children: true,
      });

      this.currentOverlay = undefined;
      this.currentOverlayId = undefined;
    }

    // No replacement

    if (id === null) {
      return;
    }

    // Create new overlay

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

    // Show new overlay

    if (!options.immediate) {
      if (overlay.animateIn) {
        await overlay.animateIn();
      } else {
        await gsap.to(overlay, {
          alpha: 1,
          duration: TRANSITION_DURATION,
          ease: "power2.out",
        });
      }
    }
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);

    gsap.killTweensOf(this.parent);

    if (this.currentOverlay) {
      gsap.killTweensOf(this.currentOverlay);
    }
  }

  private readonly handleResize = () => {
    this.currentOverlay?.onResize?.(
      this.app.screen.width,
      this.app.screen.height,
    );
  };
}
