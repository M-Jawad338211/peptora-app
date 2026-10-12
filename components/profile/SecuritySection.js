'use client'

import PasswordCard from './PasswordCard'
import TwoFactorCard from './TwoFactorCard'
import DevicesCard from './DevicesCard'
import ActivityCard from './ActivityCard'

/** Security: password, two-factor authentication, devices, recent activity. */
export default function SecuritySection({ user, onRecoveryCodes }) {
  return (
    <div className="flex flex-col gap-2.5">
      <PasswordCard user={user} />
      <TwoFactorCard onRecoveryCodes={onRecoveryCodes} />
      <DevicesCard />
      <ActivityCard />
    </div>
  )
}
