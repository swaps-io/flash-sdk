import { Duration, Instant } from '../model';

import { ExclusiveAction, ExclusiveSingleton } from './exclusive';
import { isNull } from './null';

interface CacheRecord<T> {
  value: T;
  time: Instant;
}

/**
 * Cache helper for async loads
 *
 * Loads value only when requested, caching it for specified amount
 * of time for faster further get calls
 *
 * @category Util
 */
export class Cache<T> {
  private readonly ttl: Duration;
  private readonly load: ExclusiveSingleton<T>;
  private record: CacheRecord<T> | undefined;

  public constructor(ttl: Duration, load: ExclusiveAction<T>) {
    this.ttl = ttl;
    this.load = new ExclusiveSingleton(load);
  }

  /**
   * Gets value from cache or loads it if needed
   *
   * @param force Should load be forced regardless of cache state
   *
   * @returns Loaded or cached value
   */
  public async get(force = false): Promise<T> {
    if (force || isNull(this.record) || this.record.time.elapsed().is('greater', this.ttl)) {
      const value = await this.load.execute();
      const time = Instant.now();
      this.record = { value, time };
    }
    return this.record.value;
  }

  /**
   * Gets current value stored in cache
   *
   * Cache value may be not loaded due to lazy approach
   *
   * @returns Current cached value
   */
  public getCurrent(): T | undefined {
    return this.record?.value;
  }
}
