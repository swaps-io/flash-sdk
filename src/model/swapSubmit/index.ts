/**
 * Swap submit result
 *
 * @category Swap Submit
 */
export class SwapSubmit {
  /**
   * @hidden
   */
  public readonly swapHash: string;

  /**
   * @hidden
   */
  public readonly needsCall: boolean;

  public constructor(swapHash: string, needsCall: boolean) {
    this.swapHash = swapHash;
    this.needsCall = needsCall;
  }
}
