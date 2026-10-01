'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, ShieldCheck, Star, LogOut, CalendarClock } from 'lucide-react'
import { protocols as protocolsApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { useSession, useLogout } from '@/lib/auth/session'
import { formatDate } from '@/lib/format'
import AuthGate from '@/components/auth/AuthGate'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DeleteAccount, { DeletedNotice } from './DeleteAccount'

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

function ProfileContent({ user, onDeleted }) {
  const [confirmLogout, setConfirmLogout] = useState(false)
  const logout = useLogout()

  const access = user.access
  const hasAccess = !!access?.has_access
  const copy = planCopy(access)
  // A subscription renews, so "ends in N days" would be wrong for it; its
  // date is in the sentence below instead.
  const showCountdown =
    hasAccess && !access.is_subscription && access.days_remaining != null

  // /protocols/stats/summary needs Peptora Pro. Firing it without Pro only
  // produces a 402, so the counters are simply not shown then.
  const stats = useQuery({
    queryKey: qk.protocolStats,
    queryFn: protocolsApi.stats,
    enabled: hasAccess,
    retry: false,
  })

  return (
    <div className="mx-auto max-w-[560px]">
      <div className="card mb-2.5 flex items-center gap-3.5 p-4">
        <span
          aria-hidden="true"
          className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-teal/15 text-xl font-bold text-teal"
        >
          {(user.email?.[0] ?? 'P').toUpperCase()}
        </span>
        <div className="min-w-0">
          {user.full_name && (
            <p className="text-base font-bold text-tx">{user.full_name}</p>
          )}
          <p className="truncate text-[13px] text-tx2">{user.email}</p>
        </div>
      </div>

      {hasAccess && (
        <div className="card mb-2.5 grid grid-cols-3 divide-x divide-hairline p-4">
          {[
            ['Protocols', stats.data?.total_protocols],
            ['Active', stats.data?.active_protocols],
            ['Total logs', stats.data?.total_logs],
          ].map(([label, value]) => (
            <div key={label} className="px-1 text-center">
              {stats.isPending ? (
                <Skeleton className="mx-auto h-6 w-8" />
              ) : (
                <p className="text-xl font-extrabold text-teal">{value ?? 0}</p>
              )}
              <p className="text-[11px] text-tx3-body">{label}</p>
            </div>
          ))}
        </div>
      )}

      <section className="card mb-2.5 px-4 py-1">
        <InfoRow icon={Mail} label="Email" value={user.email} />
        <InfoRow
          icon={ShieldCheck}
          label="Email verified"
          value={user.email_verified ? 'Yes' : 'No'}
          valueClass={user.email_verified ? 'text-teal' : 'text-warn'}
        />
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

      <section className="card mb-2.5 p-4">
        <p className="mb-1.5 text-[13px] font-semibold text-tx">{copy.title}</p>
        {copy.text && (
          <p className="mb-3.5 text-[12px] leading-5 text-tx3-body">{copy.text}</p>
        )}
        {/* A lifetime licence has nothing to buy, so this becomes a receipt
            rather than a sales pitch, with no button at all. */}
        {!access?.is_lifetime && (
          <Button
            href="/app/billing"
            variant={hasAccess ? 'secondary' : 'primary'}
            fullWidth
          >
            {hasAccess ? 'Buy once on the web' : 'See Peptora Pro'}
          </Button>
        )}
      </section>

      <p className="card mb-4 p-4 text-[12px] leading-5 text-tx3-body">
        Peptora is a tracking and reference tool. It records the schedule you
        set and does not recommend doses. Nothing here is medical advice.
        Talk to a qualified clinician about your own protocol.
      </p>

      <div className="space-y-2.5">
        <Button variant="secondary" onClick={() => setConfirmLogout(true)} fullWidth>
          <LogOut size={15} aria-hidden="true" />
          Log out
        </Button>

        <DeleteAccount user={user} onDeleted={onDeleted} />
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        body="You'll need to log in again to reach your protocols and history."
        confirmLabel="Log out"
        onConfirm={logout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  )
}

export default function Profile() {
  const { user } = useSession()
  // Held here, above the session check: once the account is deleted there is
  // no session, and the confirmation must stay on screen regardless.
  const [deleted, setDeleted] = useState(null)

  if (deleted) {
    return (
      <div className="mx-auto max-w-[560px]">
        <DeletedNotice subscriptionActive={deleted.subscriptionActive} />
      </div>
    )
  }

  return (
    <AuthGate
      title="Log in to view your profile"
      subtitle="Your account, protocols and dose history live here."
    >
      {user && <ProfileContent user={user} onDeleted={setDeleted} />}
    </AuthGate>
  )
}
