'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CircleCheck, Clock, LoaderCircle, TriangleAlert } from 'lucide-react'
import { qk } from '@/lib/query/keys'
import { useSession } from '@/lib/auth/session'
import Button from '@/components/ui/Button'

/**
 * Where a user waits.
 *
 * Manual verification means hours pass between "I paid" and "I have access",
 * and the user is locked out for every one of them having already sent money.
 * That gap is the biggest risk in the whole flow, so this is a timeline rather
 * than a spinner: it shows that the payment arrived, that nothing is stuck,
 * and roughly when to expect an answer.
 */

const STEPS = [
  { key: 'submitted', label: 'Payment details received' },
  { key: 'under_review', label: 'Checked by our team' },
  { key: 'approved', label: 'Licence active' },
]

// The scale here is hours, not seconds. The retired crypto return screen polled
// every 3s because it waited on a blockchain; polling a human that fast is pure
// noise. Thirty seconds is frequent enough that an approval lands while the tab
// is still open, and cheap enough to leave running.
const POLL_MS = 30_000

function stepState(claimStatus, index) {
  const order = { submitted: 0, under_review: 1, approved: 2 }
  const current = order[claimStatus] ?? 0
  if (claimStatus === 'approved') return 'done'
  if (index < current) return 'done'
  if (index === current) return 'active'
  return 'todo'
}

export default function ClaimStatus({ claim, slaHours = 24, onResubmit }) {
  const queryClient = useQueryClient()
  const { user, refetch } = useSession()
  const hasAccess = !!user?.access?.has_access

  const pending = claim?.status === 'submitted' || claim?.status === 'under_review'

  useEffect(() => {
    // Nothing to wait for once the licence is live — the shell gate opens on
    // the next render and this screen is no longer reachable.
    if (!pending || hasAccess) return

    let cancelled = false
    const tick = async () => {
      // Skip work while the tab is hidden. A backgrounded tab polling for
      // hours is battery spend with nobody watching the result.
      if (document.hidden || cancelled) return
      await queryClient.invalidateQueries({ queryKey: qk.billingClaims })
      // The session carries has_access, and it caches for five minutes — so
      // without this refetch an approved user would keep seeing the paywall
      // for another five, having already been told they were approved.
      await refetch()
    }

    const id = setInterval(tick, POLL_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [pending, hasAccess, queryClient, refetch])

  if (!claim) return null

  if (claim.status === 'rejected') {
    return (
      <section className="card border-danger/30 p-5">
        <div className="mb-3 flex items-start gap-3">
          <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
          <div>
            <h2 className="text-[15px] font-bold text-tx">
              We could not confirm this payment
            </h2>
            <p className="mt-1 text-[13px] leading-6 text-danger-text">
              {claim.review_note || REASONS[claim.rejection_reason] || REASONS.other}
            </p>
          </div>
        </div>
        <p className="mb-4 text-[13px] leading-6 text-tx3-body">
          Nothing is lost. Correct the details and send them again — we will take
          another look.
        </p>
        <Button onClick={onResubmit}>Submit corrected details</Button>
      </section>
    )
  }

  if (claim.status === 'cancelled') return null

  const window = slaHours >= 24 ? 'one business day' : `${slaHours} hours`

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-start gap-3">
        {claim.status === 'approved' ? (
          <CircleCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
        ) : (
          <LoaderCircle
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 animate-spin text-teal motion-reduce:animate-none"
          />
        )}
        <div>
          <h2 className="text-[15px] font-bold text-tx">
            {claim.status === 'approved'
              ? 'Your licence is active'
              : 'We are checking your payment'}
          </h2>
          <p className="mt-1 text-[13px] leading-6 text-tx3-body">
            {claim.status === 'approved'
              ? 'Every tool is unlocked. This is a one-time purchase — there is nothing to renew.'
              : `Every payment is checked by a person, so this is not instant. We usually get through them within ${window}, and we will email you the moment it is done.`}
          </p>
        </div>
      </div>

      <ol className="mb-4 flex flex-col gap-0">
        {STEPS.map((step, i) => {
          const state = stepState(claim.status, i)
          return (
            <li key={step.key} className="flex items-center gap-3 py-1.5">
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${
                  state === 'done'
                    ? 'bg-teal'
                    : state === 'active'
                      ? 'bg-warn'
                      : 'bg-hairline-strong'
                }`}
              />
              <span
                className={`text-[13px] ${
                  state === 'todo' ? 'text-tx3-body' : 'text-tx2'
                }`}
              >
                {step.label}
              </span>
              {state === 'active' && (
                <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-warn">
                  In progress
                </span>
              )}
            </li>
          )
        })}
      </ol>

      <dl className="border-t border-hairline pt-3 text-[12.5px]">
        <Row label="Submitted" value={formatWhen(claim.created_at)} />
        {claim.reference && <Row label="Reference" value={claim.reference} mono />}
        {claim.amount_claimed != null && (
          <Row label="Amount" value={`${claim.currency} ${claim.amount_claimed}`} />
        )}
        <Row label="Receipt" value={claim.has_receipt ? 'Attached' : 'Not attached'} />
      </dl>

      {pending && (
        <p className="mt-3 flex items-start gap-2 text-[12px] leading-5 text-tx3-body">
          <Clock size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          You can safely close this page. We will email you when it is done.
        </p>
      )}
    </section>
  )
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <dt className="text-tx3-body">{label}</dt>
      <dd className={`text-right text-tx2 ${mono ? 'font-mono text-[12px]' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

// Mirrors REJECTION_COPY in peptora-api/app/utils/email.py, so the reason a
// user reads in their inbox is the reason they see in the app.
const REASONS = {
  amount_mismatch:
    'The amount received did not match the price. If you sent a different amount, tell us what you sent.',
  receipt_unreadable:
    'We could not read the receipt you uploaded. A clearer screenshot showing the amount, date and reference should do it.',
  reference_not_found:
    'We could not find that reference on our side. Please double-check the transaction ID and submit it again.',
  duplicate_claim: 'This looks like a duplicate of a payment we have already handled.',
  not_received:
    'We have not seen this payment arrive yet. Bank transfers can take a few days — please resubmit once it has cleared.',
  other: 'We could not verify this payment from the details provided.',
}
