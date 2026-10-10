import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

// Retrying won't fix a 4xx (e.g. 404 Not Found), so only retry other failures.
function retryUnlessClientError(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: retryUnlessClientError } },
  });
}
