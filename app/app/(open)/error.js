'use client'

import { TriangleAlert } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * Route-level error boundary. The native app has none — `grep -rn
 * "ErrorBoundary\|componentDidCatch"` returns nothing, so any render throw
 * white-screens the whole app.
 */
export default function AppError({ error, reset }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <TriangleAlert
        size={48}
        strokeWidth={1.5}
        aria-hidden="true"
        className="mb-4 text-danger"
      />
      <h2 className="mb-2 text-xl font-bold text-tx">Something went wrong</h2>
      <p className="mb-6 max-w-[40ch] text-sm leading-6 text-tx3-body">
        {error?.message || 'This screen failed to load.'}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button href="/app/home" variant="secondary">
          Go home
        </Button>
      </div>
    </div>
  )
}
