import { Comparator } from '../../../helper/math/compare';

import { DurationData } from './data';

export class DurationComparator extends Comparator<DurationData, number> {
  public constructor() {
    super(convert);
  }
}

const convert = (left: DurationData, right: DurationData): [left: number, right: number] => {
  return [left.milliseconds, right.milliseconds];
};
