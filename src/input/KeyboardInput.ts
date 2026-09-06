export enum KeyboardAction {
  Pause,
  MoveLeft,
  MoveRight,
  Jump,
  end_win, // remove
  end_lose, // remove
}

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
        action = KeyboardAction.MoveLeft;
        break;

      case "ArrowRight":
      case "KeyD":
        action = KeyboardAction.MoveRight;
        break;

      case "Space":
      case "ArrowUp":
        action = KeyboardAction.Jump;
        break;

      case "Escape":
      case "KeyP":
        action = KeyboardAction.Pause;
        break;

      case "KeyN":
        action = KeyboardAction.end_lose;
        break;
      case "KeyM":
        action = KeyboardAction.end_win;
        break;
    }

    if (action === undefined) {
      return;
    }

    event.preventDefault();

    for (const listener of this._listeners) {
      listener(action);
    }
  };
}
