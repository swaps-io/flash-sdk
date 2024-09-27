import { Comparable, CompareOperation } from '../../../helper/math/compare';
import { IAdd, ISub } from '../../../helper/math/operation';
import { Data } from '../../data';

import { DurationComparator } from './compare';
import { daysToMs, hoursToMs, minsToMs, msToDays, msToHours, msToMins, msToSecs, secsToMs } from './convert';
import { DurationData } from './data';

export type { DurationData };

/**
 * Time duration. Represents time elapsed between two moments in time
 *
 * @category Duration
 */
export class Duration implements Data<DurationData>, Comparable<Duration>, IAdd<Duration>, ISub<Duration> {
  /**
   * Plain data of the duration. Can be used for serialization
   */
  public readonly data: DurationData;

  private static readonly comparator = new DurationComparator();

  public constructor(data: DurationData) {
    this.data = data;
  }

  /**
   * Constructs {@link Duration} from its milliseconds
   *
   * @param milliseconds Number of milliseconds in duration
   *
   * @returns Instance of {@link Duration}
   */
  public static fromMilliseconds(milliseconds: number): Duration {
    return new Duration({ milliseconds });
  }

  /**
   * Constructs {@link Duration} from its seconds
   *
   * @param seconds Number of seconds in duration
   *
   * @returns Instance of {@link Duration}
   */
  public static fromSeconds(seconds: number): Duration {
    return Duration.fromMilliseconds(secsToMs(seconds));
  }

  /**
   * Constructs {@link Duration} from its minutes
   *
   * @param minutes Number of minutes in duration
   *
   * @returns Instance of {@link Duration}
   */
  public static fromMinutes(minutes: number): Duration {
    return Duration.fromMilliseconds(minsToMs(minutes));
  }

  /**
   * Constructs {@link Duration} from its hours
   *
   * @param hours Number of hours in duration
   *
   * @returns Instance of {@link Duration}
   */
  public static fromHours(hours: number): Duration {
    return Duration.fromMilliseconds(hoursToMs(hours));
  }

  /**
   * Constructs {@link Duration} from its days
   *
   * @param days Number of days in duration
   *
   * @returns Instance of {@link Duration}
   */
  public static fromDays(days: number): Duration {
    return Duration.fromMilliseconds(daysToMs(days));
  }

  /**
   * Converts the essential duration info to string
   *
   * @returns String representation of the duration
   */
  public toString(): string {
    return `Duration of ${this.milliseconds} ms`;
  }

  /**
   * Number of full milliseconds in the duration
   */
  public get milliseconds(): number {
    return this.data.milliseconds;
  }

  /**
   * Number of full seconds in the duration
   */
  public get seconds(): number {
    return msToSecs(this.milliseconds);
  }

  /**
   * Number of full minutes in the duration
   */
  public get minutes(): number {
    return msToMins(this.milliseconds);
  }

  /**
   * Number of full hours in the duration
   */
  public get hours(): number {
    return msToHours(this.milliseconds);
  }

  /**
   * Number of full days in the duration
   */
  public get days(): number {
    return msToDays(this.milliseconds);
  }

  /**
   * Sleeps for amount of time specified by the duration
   */
  public async sleep(): Promise<void> {
    return new Promise((r) => setTimeout(r, this.milliseconds));
  }

  public is(compare: CompareOperation, other: Duration): boolean {
    return Duration.comparator.is(this.data, compare, other.data);
  }

  public min(other: Duration): Duration {
    return new Duration(Duration.comparator.min(this.data, other.data));
  }

  public max(other: Duration): Duration {
    return new Duration(Duration.comparator.max(this.data, other.data));
  }

  public add(other: Duration): Duration {
    return Duration.fromMilliseconds(this.milliseconds + other.milliseconds);
  }

  public sub(other: Duration): Duration {
    return Duration.fromMilliseconds(this.milliseconds - other.milliseconds);
  }
}
