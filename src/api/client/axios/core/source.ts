import { AxiosInstance } from 'axios';

/**
 * Axios instance source for API access. Can be:
 * - base URL string: `https://some-domain`
 * - port-only string: `:3000` (uses `window.location`)
 * - `AxiosInstance` implementation
 *
 * @category API
 */
export type AxiosInstanceSource = AxiosInstance | string | undefined;
