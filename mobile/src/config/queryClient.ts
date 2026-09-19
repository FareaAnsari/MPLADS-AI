import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh data window
      gcTime: 1000 * 60 * 60 * 24, // 24 hours in-memory garbage collection
      retry: (failureCount, error: any) => {
        // Do not retry 4xx errors (client errors)
        if (error?.statusCode >= 400 && error?.statusCode < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Never automatically retry mutations to prevent duplicate submissions
    },
  },
});
