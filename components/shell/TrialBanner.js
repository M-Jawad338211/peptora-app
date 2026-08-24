'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock } from 'lucide-react'
import { useSession } from '@/lib/auth/session'

// Below this, the end is close enough that a nudge is useful rather than noise.
const NUDGE_DAYS = 5

/**
 * A quiet countdown once access is nearly up.
 *
 * This matters more here than it would with cards: nothing renews on its own,
 * so a user who ignores it does not get charged — they get locked out. The
 * banner is the main thing standing between "my subscription lapsed" and
 * "Peptora broke".
 */
export default function TrialBanner() {
  const { user } = useSession()
  const pathname = usePathname()

  const access = user?.access
  // Pointless on the page that already sells the plan.
  if (!access?.has_access || pathname === '/app/pricing') return null

  const days = access.days_remaining
  if (typeof days !== 'number' || days > NUDGE_DAYS) return null

  const noun = access.is_trial ? 'Trial' : 'Access'
  const when = days <= 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`

  return (
    <Link
      href="/app/pricing"
      className="mb-3 flex items-center gap-2.5 rounded-[12px] border border-warn/25 bg-warn/10 px-3.5 py-2.5 no-underline transition-colors hover:border-warn/40"
    >
      <Clock size={15} aria-hidden="true" className="shrink-0 text-warn" />
      <span className="text-[13px] leading-5 text-tx2">
        {noun} ends {when}.{' '}
        <span className="font-semibold text-tx">
          {access.is_trial ? 'Choose a plan' : 'Extend access'} →
        </span>
      </span>
    </Link>
  )
}
