import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 24 * 60 * 60 * 1000,
        // Retrying a 4xx just repeats a rejected request. 401 is already
        // handled by the refresh-and-replay in lib/api/client.js.
        retry: (count, error) => {
          const status = error?.status
          if (status >= 400 && status < 500) return false
          return count < 1
        },
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  })
}

/**
 * Only the public encyclopedia may be written to localStorage.
 *
 * Protocols and tracker logs are personal health data and must not be left on
 * a shared machine; the session must not be persisted either, or logging out
 * would appear reversible until the cache expired.
 */
export function shouldDehydrateQuery(query) {
  return query.queryKey?.[0] === 'peptides' && query.state.status === 'success'
}
