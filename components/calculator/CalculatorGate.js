'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { calculator } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { generateFingerprint } from '@/lib/fingerprint'
import { useSession } from '@/lib/auth/session'
import { AuthPrompt } from '@/components/auth/AuthGate'
import { PlanPrompt } from '@/components/auth/PlanGate'
import Skeleton from '@/components/ui/Skeleton'

/**
 * Access control for the calculator, which is the one tool that cannot be
 * gated by the API alone.
 *
 * The reconstitution engine is pure client-side JS (lib/reconstitution.js), so
 * the server never sees a calculation happen and cannot refuse one. What the
 * API does enforce is the write side — /calculator/record-use and /history
 * both 402 without an access window — so history and saving are genuinely
 * locked. This component enforces the rest at the UI layer, which is the
 * honest limit of what is enforceable for an offline-capable PWA.
 *
 * Three states, matching the API's check-trial contract:
 *   signed out, under the anonymous allowance -> render, show what's left
 *   signed out, allowance spent              -> sign-up wall
 *   signed in, no live window                -> paywall
 */
export default function CalculatorGate({ children }) {
  const { user, isPending: sessionPending } = useSession()
  const [fingerprint, setFingerprint] = useState(null)

  useEffect(() => {
    let cancelled = false
    generateFingerprint().then((fp) => {
      if (!cancelled) setFingerprint(fp)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const hasAccess = !!user?.access?.has_access

  const trial = useQuery({
    queryKey: qk.trial(fingerprint),
    queryFn: () => calculator.checkTrial({ deviceFingerprint: fingerprint }),
    // A subscriber has nothing to check, and an unresolved fingerprint would
    // key the cache on null and answer for the wrong device.
    enabled: !!fingerprint && !sessionPending && !hasAccess,
    staleTime: 60_000,
    retry: false,
  })

  if (hasAccess) return children

  if (sessionPending || !fingerprint || trial.isPending) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  // The check itself failing must not lock people out of a tool that runs in
  // their browser anyway — fail open here, since the paid surfaces (saving,
  // history) are enforced server-side regardless.
  if (trial.isError) return children

  if (trial.data?.allowed === false) {
    return user ? (
      <PlanPrompt
        title="Subscribe to keep calculating"
        subtitle="Your trial has ended. Peptora Pro unlocks unlimited dose calculations, protocols and the cycle tracker."
      />
    ) : (
      <AuthPrompt
        title="Create an account to keep calculating"
        subtitle="You've used your free previews. New accounts get 14 days of full access, with no payment details required."
      />
    )
  }

  const remaining = trial.data?.remaining
  return (
    <>
      {!user && typeof remaining === 'number' && (
        <p className="card mb-3 p-3 text-[13px] leading-5 text-tx3-body">
          <strong className="text-tx2">
            {remaining} free calculation{remaining === 1 ? '' : 's'} left.
          </strong>{' '}
          Create an account for 14 days of unlimited access — no payment details
          needed.
        </p>
      )}
      {children}
    </>
  )
}
