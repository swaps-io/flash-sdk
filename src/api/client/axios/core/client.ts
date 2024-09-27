import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Type representing Axios client handler
 *
 * @category API
 */
export type AxiosClient = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
