import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getSession } from '@/lib/auth/server-session'
import { qk } from '@/lib/query/keys'

/**
 * PWA scope root. Reads the session server-side and seeds the query cache, so
 * the first paint already knows who the user is — no logged-out flash and no
 * /auth/me round-trip on load.
 *
 * Covers the product screens, auth and consent alike, so all of them can call
 * useSession().
 */
export default async function AppLayout({ children }) {
  const user = await getSession()

  const queryClient = new QueryClient()
  queryClient.setQueryData(qk.session, user)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  )
}
