import { Duration, Instant } from '../model';

import { ExclusiveAction, ExclusiveSingleton } from './exclusive';
import { isNull } from './null';

interface CacheRecord<T> {
  value: T;
  time: Instant;
}

export class Cache<T> {
  private readonly ttl: Duration;
  private readonly load: ExclusiveSingleton<T>;
  private record: CacheRecord<T> | undefined;

  public constructor(ttl: Duration, load: ExclusiveAction<T>) {
    this.ttl = ttl;
    this.load = new ExclusiveSingleton(load);
  }

  public async get(force = false): Promise<T> {
    if (force || isNull(this.record) || this.record.time.elapsed().is('greater', this.ttl)) {
      const value = await this.load.execute();
      const time = Instant.now();
      this.record = { value, time };
    }
    return this.record.value;
  }

  public getCurrent(): T | undefined {
    return this.record?.value;
  }
}
