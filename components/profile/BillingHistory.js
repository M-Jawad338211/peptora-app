'use client'

import { useQuery } from '@tanstack/react-query'
import { Receipt } from 'lucide-react'
import { billing } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { formatMoney, statusColor } from '@/lib/account'
import { formatDate } from '@/lib/format'
import Badge from '@/components/ui/Badge'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import SettingsCard from './SettingsCard'

/**
 * Payments and subscriptions on the account, newest first. The wording of a
 * status is the API's `status_label`; `status` only picks the colour, and the
 * label is always shown as text so colour is never the only signal.
 */
export default function BillingHistory() {
  const history = useQuery({ queryKey: qk.billingHistory, queryFn: billing.history })
  const items = history.data?.items ?? []

  return (
    <SettingsCard title="Billing history">
      {history.isPending ? (
        <div className="mt-3 space-y-3" aria-hidden="true">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : history.isError ? (
        <ErrorState
          title="Could not load your billing history"
          message={history.error?.message}
          onRetry={() => history.refetch()}
          pending={history.isFetching}
        />
      ) : items.length === 0 ? (
        <div className="mt-3 flex flex-col items-center rounded-[10px] border border-dashed border-hairline-strong px-4 py-8 text-center">
          <Receipt size={32} strokeWidth={1.4} aria-hidden="true" className="mb-2 text-tx3" />
          <p className="text-sm font-semibold text-tx">No payments yet</p>
          <p className="mt-1 max-w-[34ch] text-[13px] leading-5 text-tx3-body">
            When you buy Peptora Pro on the web or subscribe in the iPhone app, it shows up here.
          </p>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-hairline">
          {items.map((item) => {
            const amount = formatMoney(item.amount, item.currency)
            const meta = [formatDate(item.date), item.method].filter(Boolean).join(', ')
            return (
              <li key={item.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-5 text-tx">{item.title}</p>
                    {meta && <p className="mt-0.5 text-[12px] text-tx3-body">{meta}</p>}
                    {item.reference && (
                      <p className="mt-0.5 font-mono text-[11px] break-all text-tx3-body">
                        Reference {item.reference}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {amount && <p className="text-[13px] font-semibold text-tx">{amount}</p>}
                    <Badge label={item.status_label} color={statusColor(item.status)} />
                  </div>
                </div>
                {item.detail && (
                  <p className="mt-1.5 text-[12px] leading-5 text-tx3-body">{item.detail}</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </SettingsCard>
  )
}
