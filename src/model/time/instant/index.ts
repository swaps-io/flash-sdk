import { Comparable, CompareOperation } from '../../../helper/math/compare';
import { IAdd, ISub } from '../../../helper/math/operation';
import { Data } from '../../data';
import { Duration } from '../duration';

import { InstantComparator } from './compare';
import { InstantData } from './data';

export type { InstantData };

/**
 * Time instant. Represents specific moment in time
 *
 * @category Instant
 */
export class Instant
  implements Data<InstantData>, Comparable<Instant>, IAdd<Duration, Instant>, ISub<Duration, Instant>
{
  /**
   * Plain data of the instant. Can be used for serialization
   */
  public readonly data: InstantData;

  private static readonly comparator = new InstantComparator();

  public constructor(data: InstantData) {
    this.data = data;
  }

  /**
   * Constructs {@link Instant} from duration since epoch start
   *
   * @param duration Duration to construct instant from
   *
   * @returns Instance of {@link Instant}
   */
  public static fromEpochDuration(duration: Duration): Instant {
    const atMilliseconds = duration.milliseconds;
    return new Instant({ atMilliseconds });
  }

  /**
   * Constructs {@link Instant} corresponding to the current moment in time
   *
   * @returns Instance of {@link Instant}
   */
  public static now(): Instant {
    const atMilliseconds = new Date().getTime();
    return new Instant({ atMilliseconds });
  }

  /**
   * Converts the essential instant info to string
   *
   * @returns String representation of the instant
   */
  public toString(): string {
    return `Instant at ${this.data.atMilliseconds} ms`;
  }

  /**
   * Gets duration representing time elapsed from specified earlier instant to this one
   *
   * @param earlier Instant to use as duration start
   *
   * @returns Duration between the earlier instant and this one
   */
  public durationSince(earlier: Instant): Duration {
    const elapsedMilliseconds = this.data.atMilliseconds - earlier.data.atMilliseconds;
    return Duration.fromMilliseconds(elapsedMilliseconds);
  }

  /**
   * Gets duration representing time elapsed from this instant to current moment in time
   *
   * @returns Duration between this instant and now
   */
  public elapsed(): Duration {
    return Instant.now().durationSince(this);
  }

  /**
   * Converts instant to duration since epoch start
   *
   * @returns Instance of {@link Duration}
   */
  public toEpochDuration(): Duration {
    return Duration.fromMilliseconds(this.data.atMilliseconds);
  }

  public is(compare: CompareOperation, other: Instant): boolean {
    return Instant.comparator.is(this.data, compare, other.data);
  }

  public min(other: Instant): Instant {
    return new Instant(Instant.comparator.min(this.data, other.data));
  }

  public max(other: Instant): Instant {
    return new Instant(Instant.comparator.max(this.data, other.data));
  }

  public add(other: Duration): Instant {
    const atMilliseconds = this.data.atMilliseconds + other.milliseconds;
    return new Instant({ atMilliseconds });
  }

  public sub(other: Duration): Instant {
    const atMilliseconds = this.data.atMilliseconds - other.milliseconds;
    return new Instant({ atMilliseconds });
  }
}
