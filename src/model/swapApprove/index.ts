/**
 * Swap approve result
 *
 * @category Swap Approve
 */
export class SwapApprove {
  /**
   * @hidden
   */
  public readonly swapSignature: string;

  public constructor(swapSignature: string) {
    this.swapSignature = swapSignature;
  }
}
