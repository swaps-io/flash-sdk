/**
 * Data required for storing explorer
 *
 * @category Explorer
 */
export interface ExplorerData {
  /**
   * Unique ID of the explorer. Uses custom Flash format
   */
  id: string;

  /**
   * Name of the explorer
   */
  name: string;

  /**
   * Domain of the explorer
   */
  domain: string;

  /**
   * Base URL of the explorer
   */
  baseUrl: string;

  /**
   * ID of {@link Chain} the explorer is for
   */
  chainId: string;
}
