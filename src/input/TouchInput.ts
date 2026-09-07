import { KeyboardAction } from "./KeyboardInput";

export class TouchInput {
  private readonly _listeners = new Set<(action: KeyboardAction) => void>();

  private _startX = 0;
  private _startY = 0;

  private readonly _minSwipeDistance = 40;

  constructor(private readonly _element: HTMLElement = document.body) {
    this._element.addEventListener("touchstart", this._onTouchStart, {
      passive: true,
    });

    this._element.addEventListener("touchend", this._onTouchEnd, {
      passive: true,
    });
  }

  public onInput(listener: (action: KeyboardAction) => void): () => void {
    this._listeners.add(listener);

    return () => {
      this._listeners.delete(listener);
    };
  }

  public destroy(): void {
    this._element.removeEventListener("touchstart", this._onTouchStart);
    this._element.removeEventListener("touchend", this._onTouchEnd);

    this._listeners.clear();
  }

  private readonly _onTouchStart = (event: TouchEvent): void => {
    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    this._startX = touch.clientX;
    this._startY = touch.clientY;
  };

  private readonly _onTouchEnd = (event: TouchEvent): void => {
    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - this._startX;
    const deltaY = touch.clientY - this._startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Ignore taps and very small movements.
    if (Math.max(absX, absY) < this._minSwipeDistance) {
      return;
    }

    let action: KeyboardAction | undefined;

    if (absX > absY) {
      action = deltaX > 0 ? KeyboardAction.MoveRight : KeyboardAction.MoveLeft;
    } else if (deltaY < 0) {
      action = KeyboardAction.Jump;
    }

    if (action) {
      for (const listener of this._listeners) {
        listener(action);
      }
    }
  };
}
