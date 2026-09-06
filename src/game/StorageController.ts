interface GameStorageData {
  muted: boolean;
}

export class LocalStorage {
  private readonly _id = "astro-rush-storage";
  private readonly _defaults: GameStorageData;

  constructor(defaults: GameStorageData) {
    this._defaults = defaults;
  }

  public get<K extends keyof GameStorageData>(key: K): GameStorageData[K] {
    return this._read()[key];
  }

  public set<K extends keyof GameStorageData>(
    key: K,
    value: GameStorageData[K],
  ): void {
    const data = this._read();
    data[key] = value;
    this._write(data);
  }

  public has<K extends keyof GameStorageData>(key: K): boolean {
    return key in this._read();
  }

  public remove<K extends keyof GameStorageData>(key: K): void {
    const data = this._read();
    delete data[key];
    this._write(data);
  }

  public clear(): void {
    try {
      window.localStorage.removeItem(this._id);
    } catch {}
  }

  private _read(): GameStorageData {
    try {
      const value = window.localStorage.getItem(this._id);

      if (!value) {
        return { ...this._defaults };
      }

      const data = JSON.parse(value) as Partial<GameStorageData>;

      return {
        ...this._defaults,
        ...data,
      };
    } catch {
      return { ...this._defaults };
    }
  }

  private _write(data: GameStorageData): void {
    try {
      window.localStorage.setItem(this._id, JSON.stringify(data));
    } catch {
      // Ignore localStorage errors.
    }
  }
}
