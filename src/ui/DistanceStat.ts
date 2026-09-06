import { Container, Text, TextStyle } from "pixi.js";
import { gsap } from "gsap";

export interface DistanceStatOptions {
  initialDistance?: number;
}

const LABEL_Y = -18;
const VALUE_Y = 14;

export class DistanceStat extends Container {
  private readonly label: Text;
  private readonly value: Text;

  private distance = 0;

  constructor(options: DistanceStatOptions = {}) {
    super();

    this.distance = Math.max(0, options.initialDistance ?? 0);

    this.label = new Text(
      "Distance",
      new TextStyle({
        fontFamily: "Bungee Regular",
        fontSize: 16,
        fontWeight: "700",
        fill: 0x5b4f56,
        align: "center",
        letterSpacing: 1,
      }),
    );

    this.value = new Text(
      this._formatDistance(this.distance),
      new TextStyle({
        fontFamily: "Bungee Regular",
        fontSize: 38,
        fontWeight: "800",
        fill: 0x1d1520,
        align: "center",
        letterSpacing: 0.5,
      }),
    );

    this.label.anchor.set(0.5);
    this.value.anchor.set(0.5);

    this.label.position.set(0, LABEL_Y);
    this.value.position.set(0, VALUE_Y);

    this.value.style.dropShadow = true;
    this.value.style.dropShadowColor = 0xffffff;
    this.value.style.dropShadowBlur = 0;
    this.value.style.dropShadowDistance = 3;
    this.value.style.dropShadowAlpha = 0.9;

    this.addChild(this.label, this.value);

    this.scale.set(1);
  }

  public set(distance: number): void {
    gsap.killTweensOf(this);

    this.distance = Math.max(0, distance);
    this.value.text = this._formatDistance(this.distance);

    this.value.scale.set(1);
  }

  public animateTo(distance: number, duration: number = 3): gsap.core.Tween {
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.value);
    gsap.killTweensOf(this.value.scale);

    const targetDistance = Math.max(0, distance);

    const target = {
      value: this.distance,
    };

    let displayedValue = Math.round(this.distance);

    this.value.scale.set(0.92);

    const tween = gsap.to(target, {
      value: targetDistance,
      duration,
      ease: "power3.out",

      onUpdate: () => {
        this.distance = target.value;

        const nextDisplayedValue = Math.round(target.value);

        if (nextDisplayedValue !== displayedValue) {
          displayedValue = nextDisplayedValue;
          this.value.text = `${nextDisplayedValue}M`;

          gsap.killTweensOf(this.value.scale);

          gsap.fromTo(
            this.value.scale,
            {
              x: 1.08,
              y: 1.08,
            },
            {
              x: 1,
              y: 1,
              duration: 0.09,
              ease: "power2.out",
              overwrite: true,
            },
          );
        }
      },

      onComplete: () => {
        this.distance = targetDistance;
        this.value.text = this._formatDistance(targetDistance);

        gsap.killTweensOf(this.value.scale);

        gsap.to(this.value.scale, {
          x: 1,
          y: 1,
          duration: 0.12,
          ease: "back.out(2)",
          overwrite: true,
        });
      },
    });

    gsap.fromTo(
      this.value.scale,
      {
        x: 0.92,
        y: 0.92,
      },
      {
        x: 1,
        y: 1,
        duration: 0.35,
        ease: "back.out(1.8)",
        overwrite: true,
      },
    );

    gsap.fromTo(
      this.label,
      {
        alpha: 0.6,
        y: LABEL_Y + 3,
      },
      {
        alpha: 1,
        y: LABEL_Y,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      },
    );

    return tween;
  }

  private _formatDistance(distance: number): string {
    return `${Math.round(distance)}M`;
  }
}
