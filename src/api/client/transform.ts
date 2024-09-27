import { Nullish, isNull } from '../../helper/null';

/**
 * Normalizes base URL. Supported:
 * - nullish value - to `undefined`
 * - port-only value (`:3000`) - to full URL using `window.location`
 *
 * @param baseUrl Base URL to normalize
 *
 * @category API
 */
export const normalizeBaseUrl = (baseUrl: Nullish<string>): string | undefined => {
  if (isNull(baseUrl)) {
    return undefined;
  }

  const isPortOnly = baseUrl.startsWith(':');
  if (isPortOnly) {
    const port = baseUrl.replace(':', '');
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }

  return baseUrl;
};
