'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock } from 'lucide-react'
import { useSession } from '@/lib/auth/session'

// Below this, the end is close enough that a nudge is useful rather than noise.
const NUDGE_DAYS = 5

/**
 * A quiet countdown once the trial is nearly up.
 *
 * This matters more than a subscription nudge would: at the end of the trial
 * the whole app locks, and buying is a manual process that takes hours to
 * clear. Someone who leaves it until the last day is locked out for a while
 * even after paying — so the banner is what buys them the time to avoid that.
 */
export default function TrialBanner() {
  const { user } = useSession()
  const pathname = usePathname()

  const access = user?.access

  // A one-time licence has no end date. Counting down at a user who bought the
  // product outright would be nonsense, and alarming nonsense at that.
  if (!access?.has_access || access.is_lifetime) return null

  // Pointless on the page that already sells the licence.
  if (pathname === '/app/billing') return null

  const days = access.days_remaining
  if (typeof days !== 'number' || days > NUDGE_DAYS) return null

  const noun = access.is_trial ? 'Trial' : 'Access'
  const when = days <= 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`

  return (
    <Link
      href="/app/billing"
      className="mb-3 flex items-center gap-2.5 rounded-[12px] border border-warn/25 bg-warn/10 px-3.5 py-2.5 no-underline transition-colors hover:border-warn/40"
    >
      <Clock size={15} aria-hidden="true" className="shrink-0 text-warn" />
      <span className="text-[13px] leading-5 text-tx2">
        {noun} ends {when}. Payments are checked by hand, so allow a day.{' '}
        <span className="font-semibold text-tx">Unlock Peptora →</span>
      </span>
    </Link>
  )
}
