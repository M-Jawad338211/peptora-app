'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CircleCheck, LoaderCircle, Clock } from 'lucide-react'
import { qk } from '@/lib/query/keys'
import { useSession } from '@/lib/auth/session'

// A confirmed on-chain payment usually settles in well under a minute, but a
// congested chain can take longer. Poll for two minutes, then stop and tell
// the user it will land on its own rather than spinning forever.
const POLL_MS = 3000
const MAX_POLLS = 40

/**
 * Reconciles the browser with the payment after a return from NOWPayments.
 *
 * The redirect back is a browser event; crediting happens on a server-to-server
 * IPN callback, and there is no ordering between them. So arriving here does
 * not mean the account is upgraded yet — it means it is about to be.
 *
 * Two things would otherwise go wrong. useSession caches for five minutes, so
 * a paying user would sit on a stale "Free" session and keep seeing paywalls.
 * And a single refetch on mount would usually fire before the IPN arrived and
 * confirm the wrong answer. Hence polling until access flips.
 */
export default function CheckoutReturn() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { user, refetch } = useSession()

  const isReturn = params.get('checkout') === 'success'
  const hasAccess = !!user?.access?.has_access

  // Success is derived from the session, never mirrored into state: the
  // session is already the source of truth, and copying it here would let the
  // two disagree. Only "we have been waiting too long" is genuinely local.
  const [tooSlow, setTooSlow] = useState(false)
  const pollsRef = useRef(0)

  useEffect(() => {
    // Nothing to poll for: not a checkout return, or already credited (the
    // common case on a fast chain, where the IPN beats the browser redirect).
    if (!isReturn || hasAccess) return

    let cancelled = false
    const tick = async () => {
      if (cancelled) return
      pollsRef.current += 1
      await queryClient.invalidateQueries({ queryKey: qk.session })
      await refetch()
      if (pollsRef.current >= MAX_POLLS && !cancelled) setTooSlow(true)
    }

    const id = setInterval(tick, POLL_MS)
    tick()
    return () => {
      cancelled = true
      clearInterval(id)
    }
    // hasAccess is deliberately in the deps: the effect tears the interval
    // down as soon as the session flips, which is what stops the polling.
  }, [isReturn, hasAccess, queryClient, refetch])

  // Clear the query param once resolved so a refresh or a shared URL does not
  // replay the banner. replace(), not push(), to keep it out of history.
  useEffect(() => {
    if (isReturn && hasAccess) {
      const t = setTimeout(() => router.replace(pathname, { scroll: false }), 6000)
      return () => clearTimeout(t)
    }
  }, [isReturn, hasAccess, router, pathname])

  if (!isReturn) return null

  if (hasAccess) {
    return (
      <div
        role="status"
        className="card mb-3 flex items-start gap-3 border-teal/30 p-4"
      >
        <CircleCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
        <div>
          <p className="text-[13px] font-semibold text-tx">Payment confirmed</p>
          <p className="mt-0.5 text-[12px] leading-5 text-tx3-body">
            Every tool is unlocked. Nothing renews automatically — we will email
            you before your access ends.
          </p>
        </div>
      </div>
    )
  }

  if (tooSlow) {
    return (
      <div role="status" className="card mb-3 flex items-start gap-3 p-4">
        <Clock size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-warn" />
        <div>
          <p className="text-[13px] font-semibold text-tx">
            Still waiting on the network
          </p>
          <p className="mt-0.5 text-[12px] leading-5 text-tx3-body">
            Your payment is on its way but the chain has not settled it yet.
            Nothing is lost — access unlocks by itself once it confirms, and we
            will email you. You can safely close this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div role="status" className="card mb-3 flex items-start gap-3 p-4">
      <LoaderCircle
        size={18}
        aria-hidden="true"
        className="mt-0.5 shrink-0 animate-spin text-teal"
      />
      <div>
        <p className="text-[13px] font-semibold text-tx">Confirming your payment…</p>
        <p className="mt-0.5 text-[12px] leading-5 text-tx3-body">
          Waiting for the network to settle the transaction. This usually takes
          under a minute.
        </p>
      </div>
    </div>
  )
}
