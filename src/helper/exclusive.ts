import { isNotNull, isNull } from './null';

/**
 * Action that can be executed exclusively
 *
 * @category Util
 */
export type ExclusiveAction<T> = () => Promise<T>;

export interface ExclusiveSingletonOptions {
  immediate?: boolean;
}

export class ExclusiveSingleton<T> {
  private readonly action: ExclusiveAction<T>;
  private activeAction: Promise<T> | undefined;

  public constructor(action: ExclusiveAction<T>, options: ExclusiveSingletonOptions = {}) {
    this.action = action;
    if (options.immediate) {
      void this.execute();
    }
  }

  public async execute(): Promise<T> {
    if (isNull(this.activeAction)) {
      this.activeAction = this.action();
    }

    let result: T;
    try {
      result = await this.activeAction;
    } finally {
      delete this.activeAction;
    }

    return result;
  }
}

export class ExclusiveInit<T> {
  private readonly init: ExclusiveSingleton<T>;
  private result: T | undefined;

  public constructor(init: ExclusiveAction<T>) {
    this.init = new ExclusiveSingleton(init, { immediate: true });
  }

  public initialized(): boolean {
    return isNotNull(this.result);
  }

  public async get(): Promise<T> {
    if (isNull(this.result)) {
      this.result = await this.init.execute();
    }
    return this.result;
  }
}

export class ExclusivePool {
  private activeAction: ExclusiveSingleton<unknown> | undefined;

  public async execute<T>(action: ExclusiveAction<T>): Promise<T> {
    while (isNotNull(this.activeAction)) {
      try {
        await this.activeAction.execute();
      } catch {
        // Ignore foreign promise error
      }
    }

    const activeAction = new ExclusiveSingleton(action);
    this.activeAction = activeAction;

    let result: T;
    try {
      result = await activeAction.execute();
    } finally {
      delete this.activeAction;
    }

    return result;
  }
}
