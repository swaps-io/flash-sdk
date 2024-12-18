import { isNull } from '../../../helper/null';
import { SendTransactionParams } from '../../../wallet';

export type SwapCallParams = Omit<SendTransactionParams, 'tag'>;

export class SwapCallRequest {
  public readonly callParams: SendTransactionParams | undefined;

  public constructor(callParams: SwapCallParams | undefined) {
    if (isNull(callParams)) {
      return;
    }

    this.callParams = {
      ...callParams,
      tag: 'call-swap',
    };
  }
}
