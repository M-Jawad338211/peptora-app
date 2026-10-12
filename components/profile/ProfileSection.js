'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { protocols as protocolsApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { useLogout } from '@/lib/auth/session'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DeleteAccount from './DeleteAccount'
import PhotoCard from './PhotoCard'
import NamePhoneForm from './NamePhoneForm'
import EmailCard from './EmailCard'

/**
 * Profile: photo, name, phone, email, the counters the page always showed, the
 * disclaimer, and at the bottom the two ways out: log out and delete account.
 */
export default function ProfileSection({ user, onDeleted }) {
  const [confirmLogout, setConfirmLogout] = useState(false)
  const logout = useLogout()
  const hasAccess = !!user.access?.has_access

  // /protocols/stats/summary needs Peptora Pro. Firing it without Pro only
  // produces a 402, so the counters are simply not shown then.
  const stats = useQuery({
    queryKey: qk.protocolStats,
    queryFn: protocolsApi.stats,
    enabled: hasAccess,
    retry: false,
  })

  return (
    <div className="flex flex-col gap-2.5">
      <PhotoCard user={user} />

      {hasAccess && (
        <div className="card grid grid-cols-3 divide-x divide-hairline p-4">
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

      <NamePhoneForm user={user} />
      <EmailCard user={user} />

      <p className="card p-4 text-[12px] leading-5 text-tx3-body">
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
