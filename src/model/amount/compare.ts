import { Comparator } from '../../helper/math/compare';

import { AmountData } from './data';
import { toSameOrderInts } from './math';

export class AmountComparator extends Comparator<AmountData, bigint> {
  public constructor() {
    super(convert);
  }
}

const convert = (left: AmountData, right: AmountData): [left: bigint, right: bigint] => {
  const [leftNum, rightNum] = toSameOrderInts(left, right);
  return [leftNum, rightNum];
};
