/**
 * Data required for storing chain
 *
 * @category Chain
 */
export interface ChainData {
  /**
   * Unique ID of the chain. Corresponds to {@link https://chainlist.org | EVM chain ID}
   */
  id: string;

  /**
   * Name of the chain
   */
  name: string;

  /**
   * Icon URL of the chain
   */
  icon: string;

  /**
   * Primary color of the chain {@link Chain.icon | icon}
   */
  color: string;

  /**
   * Related "layer-1" chain if current chain is "layer-2"
   */
  layer1Parent: string | undefined;
}
