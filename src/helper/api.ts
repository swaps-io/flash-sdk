import { AxiosError } from 'axios';

/**
 * Gets 'detail' field value of an API error
 *
 * @param error API error
 *
 * @returns Value of 'detail' field or empty string if unavailable
 *
 * @category API
 */
export const getApiErrorDetail = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
  }

  return '';
};
