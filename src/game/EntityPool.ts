export interface Poolable {
  onPoolAcquire?(): void;
  onPoolRelease?(): void;
}

interface IPool {
  acquire(): Poolable;
  release(entity: Poolable): void;
  clear(): void;
}

export enum POOL_ID {
  obstacle,
  collectible,
}

class Pool<T extends Poolable> implements IPool {
  private readonly _available: T[] = [];
  private readonly _create: () => T;

  constructor(create: () => T, initialSize = 0) {
    this._create = create;

    for (let i = 0; i < initialSize; i++) {
      this._available.push(this._create());
    }
  }

  acquire(): T {
    const entity = this._available.pop() ?? this._create();

    entity.onPoolAcquire?.();

    return entity;
  }

  release(entity: Poolable): void {
    this._available.push(entity as T);
    entity.onPoolRelease?.();
  }

  clear(): void {
    this._available.length = 0;
  }

  get available(): number {
    return this._available.length;
  }
}

export class EntityPool {
  private readonly _pools = new Map<POOL_ID, IPool>();

  register<T extends Poolable>(
    id: POOL_ID,
    create: () => T,
    initialSize = 0,
  ): void {
    if (this._pools.has(id)) {
      throw new Error(`Entity pool already registered: ${id}`);
    }

    this._pools.set(id, new Pool(create, initialSize));
  }

  create<T extends Poolable>(id: POOL_ID): T {
    const pool = this._pools.get(id);

    if (!pool) {
      throw new Error(`No entity pool registered for "${id}"`);
    }

    return pool.acquire() as T;
  }

  release(id: POOL_ID, entity: Poolable): void {
    const pool = this._pools.get(id);

    if (!pool) {
      throw new Error(`No entity pool registered for "${id}"`);
    }

    pool.release(entity);
  }

  clear(): void {
    for (const pool of this._pools.values()) {
      pool.clear();
    }
  }
}
