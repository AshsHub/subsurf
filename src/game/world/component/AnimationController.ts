import gsap from "gsap";

export class AnimationController {
  private readonly _animations = new Set<gsap.core.Animation>();

  public to(target: gsap.TweenTarget, vars: gsap.TweenVars): gsap.core.Tween {
    const animation = gsap.to(target, vars);

    this._animations.add(animation);

    return animation;
  }

  public fromTo(
    target: gsap.TweenTarget,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
  ): gsap.core.Tween {
    const animation = gsap.fromTo(target, fromVars, toVars);

    this._animations.add(animation);

    return animation;
  }

  public timeline(vars?: gsap.TimelineVars): gsap.core.Timeline {
    const timeline = gsap.timeline(vars);
    this._animations.add(timeline);

    return timeline;
  }

  public pause(): void {
    for (const animation of this._animations) {
      animation.pause();
    }
  }

  public resume(): void {
    for (const animation of this._animations) {
      animation.resume();
    }
  }

  public kill(): void {
    for (const animation of this._animations) {
      animation.kill();
    }

    this._animations.clear();
  }
}
