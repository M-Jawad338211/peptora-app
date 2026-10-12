'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { tabFromParam } from '@/lib/account'
import { useSession } from '@/lib/auth/session'
import AuthGate from '@/components/auth/AuthGate'
import { DeletedNotice } from './DeleteAccount'
import AccountNav from './AccountNav'
import ProfileSection from './ProfileSection'
import SecuritySection from './SecuritySection'
import BillingSection from './BillingSection'
import RecoveryCodesDialog from './RecoveryCodesDialog'

/**
 * Account settings: a sub-navigation and one section at a time, chosen by
 * `?tab=` in the URL (profile, security, billing).
 *
 * The recovery codes dialog lives here, above the sections, so that it stays
 * on screen if the user moves to another section while it is open.
 */
function AccountSettings({ user, onDeleted }) {
  const tab = tabFromParam(useSearchParams().get('tab'))
  const [recoveryCodes, setRecoveryCodes] = useState(null)

  return (
    <>
      <div className="mx-auto max-w-[560px] lg:grid lg:max-w-[820px] lg:grid-cols-[176px_minmax(0,1fr)] lg:gap-8">
        <AccountNav tab={tab} />
        <div className="min-w-0">
          {tab === 'profile' && <ProfileSection user={user} onDeleted={onDeleted} />}
          {tab === 'security' && (
            <SecuritySection user={user} onRecoveryCodes={setRecoveryCodes} />
          )}
          {tab === 'billing' && <BillingSection user={user} />}
        </div>
      </div>
      <RecoveryCodesDialog
        codes={recoveryCodes}
        email={user.email}
        onDone={() => setRecoveryCodes(null)}
      />
    </>
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
      {user && <AccountSettings user={user} onDeleted={setDeleted} />}
    </AuthGate>
  )
}
