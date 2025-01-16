import { SignTypedDataParams } from '../../../wallet';

export class SwapApproveRequest {
  public readonly swapSignParams: SignTypedDataParams;

  public constructor(operation: string | undefined, from: string, data: string, chainId: string | undefined) {
    this.swapSignParams = {
      operation,
      tag: 'approve-swap',
      from,
      data,
      chainId,
    };
  }
}
