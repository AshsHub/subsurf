import type { Application, Container } from "pixi.js";
import { gsap } from "gsap";
import type { Scene, SceneTransitionOptions } from "./Scene";

const TRANSITION_DURATION = 0.45;

export class SceneManager {
  private readonly app: Application;
  private readonly parent: Container;
  private currentScene: Scene | undefined;

  constructor(app: Application, parent: Container) {
    this.app = app;
    this.parent = parent;
    window.addEventListener("resize", this.handleResize);
  }

  async show(scene: Scene, options: SceneTransitionOptions = {}) {
    const previousScene = this.currentScene;

    if (previousScene && !options.immediate) {
      await gsap.to(previousScene, {
        alpha: 0,
        duration: TRANSITION_DURATION,
        ease: "power2.inOut",
      });
    }

    if (previousScene) {
      await previousScene.onExit?.();
      this.app.stage.removeChild(previousScene as Container);
      previousScene.destroy({ children: true });
    }

    this.currentScene = scene;
    scene.alpha = options.immediate ? 1 : 0;
    this.parent.addChild(scene);
    scene.onResize?.(this.app.screen.width, this.app.screen.height);
    await scene.onEnter?.(this.app);

    if (!options.immediate) {
      await gsap.to(scene, {
        alpha: 1,
        duration: TRANSITION_DURATION,
        ease: "power2.out",
      });
    }
  }

  async clear() {
    if (!this.currentScene) {
      return;
    }

    const scene = this.currentScene;
    this.currentScene = undefined;
    await scene.onExit?.();
    this.parent.removeChild(scene as Container);
    scene.destroy({ children: true });
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
  }

  private readonly handleResize = () => {
    this.currentScene?.onResize?.(
      this.app.screen.width,
      this.app.screen.height,
    );
  };
}
