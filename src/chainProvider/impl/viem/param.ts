import type { Chain, createPublicClient } from 'viem';

/**
 * Batch configuration for Viem chain provider
 *
 * @category Chain Provider Impl
 */
export type ViemChainProviderBatch = NonNullable<Parameters<typeof createPublicClient>[0]['batch']>;

/**
 * Params for {@link ViemChainProvider} constructor
 *
 * @category Chain Provider Impl
 */
export interface ViemChainProviderParams {
  /**
   * Custom list of chain configurations to enable
   *
   * Defaults to chain configurations provided by the Viem library
   *
   * If provided:
   * - the list must include at least one element
   * - chain IDs must be unique across the list
   */
  chains?: readonly Chain[];

  /**
   * Batch configuration to use for Viem public client
   */
  batch?: ViemChainProviderBatch;
}
