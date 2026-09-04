export type KeyboardAction = "pause" | "left" | "right" | "jump";

export class KeyboardInput {
  private readonly _listeners = new Set<(action: KeyboardAction) => void>();

  constructor() {
    window.addEventListener("keydown", this._onKeyDown);
  }

  public onAction(listener: (action: KeyboardAction) => void): () => void {
    this._listeners.add(listener);

    return () => {
      this._listeners.delete(listener);
    };
  }

  public destroy(): void {
    window.removeEventListener("keydown", this._onKeyDown);
    this._listeners.clear();
  }

  private readonly _onKeyDown = (event: KeyboardEvent): void => {
    let action: KeyboardAction | undefined;

    switch (event.code) {
      case "ArrowLeft":
      case "KeyA":
        action = "left";
        break;

      case "ArrowRight":
      case "KeyD":
        action = "right";
        break;

      case "Space":
      case "ArrowUp":
        action = "jump";
        break;

      case "Escape":
      case "KeyP":
        action = "pause";
        break;
    }

    if (!action) {
      return;
    }

    event.preventDefault();

    for (const listener of this._listeners) {
      listener(action);
    }
  };
}
