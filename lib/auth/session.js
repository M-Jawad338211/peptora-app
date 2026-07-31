'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { auth, ApiError } from '@/lib/api'
import { qk } from '@/lib/query/keys'

/**
 * Client-side view of the session.
 *
 * The cache is seeded on the server (see app/app/(shell)/layout.js), so on a
 * fresh load this resolves from hydrated data with no request — the first
 * paint is already correct, no logged-out flash.
 */
export function useSession() {
  const query = useQuery({
    queryKey: qk.session,
    queryFn: async () => {
      try {
        return await auth.me()
      } catch (err) {
        // 401 (no/expired session) and 403 (email unverified) are both
        // "signed out" as far as the UI is concerned. Anything else is a real
        // failure and should surface.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          return null
        }
        throw err
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  })

  return {
    user: query.data ?? null,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useLogout(redirectTo = '/app/auth/login') {
  const queryClient = useQueryClient()
  const router = useRouter()

  return async () => {
    try {
      await auth.logout()
    } catch {
      // The cookies may already be gone; clearing local state still matters.
    }
    // Drops every cached query, so no protocol or tracker data survives a
    // logout in memory.
    queryClient.clear()
    router.replace(redirectTo)
    router.refresh()
  }
}
