import { SignTypedDataParams } from '../../../wallet';

export class SwapApproveRequest {
  public readonly swapSignParams: SignTypedDataParams;
  public readonly chainId: string;

  public constructor(operation: string | undefined, from: string, data: string, chainId: string) {
    this.swapSignParams = {
      operation,
      tag: 'approve-swap',
      from,
      data,
    };
    this.chainId = chainId;
  }
}
