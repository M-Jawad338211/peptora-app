'use client'

import { CalendarClock, Star } from 'lucide-react'
import { formatDate } from '@/lib/format'
import Button from '@/components/ui/Button'
import BillingHistory from './BillingHistory'

/**
 * What the account has, in plain words. `access` comes from the API; nothing
 * here works it out from dates.
 */
function planCopy(access) {
  if (access?.is_revoked) {
    return {
      plan: 'Free',
      title: 'Your access has been withdrawn',
      text: 'Get in touch and we will look into it with you.',
    }
  }
  if (access?.is_lifetime) {
    return {
      plan: 'Pro',
      title: 'You own Peptora Pro',
      text: 'A one-time purchase. There is no renewal, no expiry and nothing to cancel.',
    }
  }
  if (access?.is_subscription) {
    const when = formatDate(access.subscription_expires_at)
    const renews = access.subscription_auto_renew !== false
    return {
      plan: 'Pro',
      title: 'Peptora Pro subscription',
      text: `Bought in the iPhone app${
        when ? `, and ${renews ? 'renews' : 'ends'} on ${when}` : ''
      }. Manage or cancel it in your App Store account settings.`,
    }
  }
  if (access?.is_trial) {
    return {
      plan: 'Trial',
      title: 'You are on the trial of Peptora Pro',
      text: 'When the trial ends, protocols, the tracker and your history are locked. The library and the calculator stay free.',
    }
  }
  if (access?.has_access) {
    return { plan: 'Pro', title: 'Peptora Pro is active', text: null }
  }
  return {
    plan: 'Free',
    title: 'Peptora Pro',
    text: 'Protocols, the tracker and your history are part of Peptora Pro. The library and the calculator are free.',
  }
}

function InfoRow({ icon: Icon, label, value, valueClass = 'text-tx' }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon size={16} aria-hidden="true" className="shrink-0 text-tx3-body" />
      <span className="flex-1 text-[13px] text-tx2">{label}</span>
      <span className={`text-[13px] font-semibold ${valueClass}`}>{value}</span>
    </div>
  )
}

/**
 * Billing: the plan and its states as the Profile page always showed them, the
 * link to the billing page, and the history of payments.
 */
export default function BillingSection({ user }) {
  const access = user.access
  const hasAccess = !!access?.has_access
  const copy = planCopy(access)
  // A subscription renews, so "ends in N days" would be wrong for it; its
  // date is in the sentence below instead.
  const showCountdown = hasAccess && !access.is_subscription && access.days_remaining != null

  return (
    <div className="flex flex-col gap-2.5">
      <section className="card px-4 py-1">
        <InfoRow
          icon={Star}
          label="Plan"
          value={copy.plan}
          valueClass={hasAccess ? 'text-teal' : 'text-tx2'}
        />
        {showCountdown && (
          <InfoRow
            icon={CalendarClock}
            label={access.is_trial ? 'Trial ends in' : 'Access ends in'}
            value={`${access.days_remaining} day${access.days_remaining === 1 ? '' : 's'}`}
            valueClass={access.days_remaining <= 3 ? 'text-warn' : 'text-tx'}
          />
        )}
      </section>

      <section className="card p-4">
        <p className="mb-1.5 text-[13px] font-semibold text-tx">{copy.title}</p>
        {copy.text && <p className="mb-3.5 text-[12px] leading-5 text-tx3-body">{copy.text}</p>}
        {/* A lifetime licence has nothing to buy, so this becomes a receipt
            rather than a sales pitch, with no button at all. */}
        {!access?.is_lifetime && (
          <Button href="/app/billing" variant={hasAccess ? 'secondary' : 'primary'} fullWidth>
            {hasAccess ? 'Buy once on the web' : 'See Peptora Pro'}
          </Button>
        )}
      </section>

      <BillingHistory />
    </div>
  )
}
