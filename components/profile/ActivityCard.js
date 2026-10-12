'use client'

import { useQuery } from '@tanstack/react-query'
import { auth } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { formatWhen, platformLabel } from '@/lib/account'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import SettingsCard from './SettingsCard'

/** The last 20 security events on the account: sign-ins, changes, sign-outs. */
export default function ActivityCard() {
  // Always asked again when the section opens: a list that is a minute old
  // would hide the change that was just made.
  const activity = useQuery({
    queryKey: qk.activity,
    queryFn: () => auth.activity(20),
    staleTime: 0,
  })

  return (
    <SettingsCard
      title="Recent activity"
      description="The last 20 security events on your account. If you do not recognise one, change your password."
    >
      {activity.isPending ? (
        <div className="mt-3 space-y-3" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      ) : activity.isError ? (
        <ErrorState
          title="Could not load your activity"
          message={activity.error?.message}
          onRetry={() => activity.refetch()}
          pending={activity.isFetching}
        />
      ) : activity.data?.items?.length ? (
        <ul className="mt-2 divide-y divide-hairline">
          {activity.data.items.map((item) => {
            const platform = platformLabel(item.platform)
            return (
              <li key={item.id} className="py-2.5">
                <p
                  className={`text-[13px] font-semibold ${
                    item.action === 'login_two_factor_failed' ? 'text-warn' : 'text-tx'
                  }`}
                >
                  {item.label}
                </p>
                <p className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-tx3-body">
                  <span>{formatWhen(item.created_at)}</span>
                  {platform && <span>{platform}</span>}
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-3 text-[13px] text-tx3-body">No security activity yet.</p>
      )}
    </SettingsCard>
  )
}
