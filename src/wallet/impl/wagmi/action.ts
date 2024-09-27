/**
 * Meta information of a {@link WagmiWalletAction}.
 *
 * @category Wallet Impl
 */
export interface WagmiActionMeta {
  /**
   * Action type. Can be used as identifier for selecting action description.
   */
  type: string;

  /**
   * Meta parameters of the action that provide specifics.
   *
   * Number of parameters may vary depends on action type.
   */
  params: string[];
}

/**
 * Wagmi wallet action representation.
 *
 * @category Wallet Impl
 */
export class WagmiWalletAction {
  /**
   * Unique ID assigned to this wallet action.
   */
  public readonly id: string;

  /**
   * Operation ID this wallet action belongs to.
   */
  public readonly operation: string;

  /**
   * Meta information about this wallet action type.
   */
  public readonly meta: WagmiActionMeta;

  public constructor(id: string, operation: string, meta: WagmiActionMeta) {
    this.id = id;
    this.operation = operation;
    this.meta = meta;
  }
}
