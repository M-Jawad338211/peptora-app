'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/query/client'

/**
 * Mounted once in the root layout so every page — marketing and app alike —
 * has a query client. The /app layout adds a HydrationBoundary on top to seed
 * the server-read session.
 *
 * The client is created in useState so it is per-mount and never shared
 * across requests on the server.
 */
export default function Providers({ children }) {
  const [queryClient] = useState(makeQueryClient)

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
