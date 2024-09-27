import { Comparator } from '../../../helper/math/compare';

import { InstantData } from './data';

export class InstantComparator extends Comparator<InstantData, number> {
  public constructor() {
    super(convert);
  }
}

const convert = (left: InstantData, right: InstantData): [left: number, right: number] => {
  return [left.atMilliseconds, right.atMilliseconds];
};
