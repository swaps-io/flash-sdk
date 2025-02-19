import { SignTypedDataParams } from '../../../wallet';

type SwapApproveSignParams = Omit<SignTypedDataParams, 'tag'>;

export class SwapApproveRequest {
  public readonly swapSignParams: SignTypedDataParams;

  public constructor(params: SwapApproveSignParams) {
    this.swapSignParams = {
      tag: 'approve-swap',
      ...params,
    };
  }
}
