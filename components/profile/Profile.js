'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, ShieldCheck, Star, LogOut } from 'lucide-react'
import { protocols as protocolsApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { useSession, useLogout } from '@/lib/auth/session'
import AuthGate from '@/components/auth/AuthGate'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

function InfoRow({ icon: Icon, label, value, valueClass = 'text-tx' }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon size={16} aria-hidden="true" className="shrink-0 text-tx3-body" />
      <span className="flex-1 text-[13px] text-tx2">{label}</span>
      <span className={`text-[13px] font-semibold ${valueClass}`}>{value}</span>
    </div>
  )
}

function ProfileContent({ user }) {
  const [confirmLogout, setConfirmLogout] = useState(false)
  const logout = useLogout()

  const stats = useQuery({
    queryKey: qk.protocolStats,
    queryFn: protocolsApi.stats,
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

      <section className="card mb-2.5 px-4 py-1">
        <InfoRow icon={Mail} label="Email" value={user.email} />
        <InfoRow
          icon={ShieldCheck}
          label="Email verified"
          value={user.email_verified ? 'Yes' : 'No'}
          valueClass={user.email_verified ? 'text-teal' : 'text-warn'}
        />
        <InfoRow icon={Star} label="Plan" value={user.plan === 'pro' ? 'Pro' : 'Free'} />
      </section>

      <p className="card mb-4 p-4 text-[12px] leading-5 text-tx3-body italic">
        Peptora is for research and educational use only. Nothing here
        constitutes medical advice. Always consult a qualified healthcare
        professional.
      </p>

      <Button variant="danger" onClick={() => setConfirmLogout(true)} fullWidth>
        <LogOut size={15} aria-hidden="true" />
        Log out
      </Button>

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

  return (
    <AuthGate
      title="Log in to view your profile"
      subtitle="Your account, protocols and dose history live here."
    >
      {user && <ProfileContent user={user} />}
    </AuthGate>
  )
}
