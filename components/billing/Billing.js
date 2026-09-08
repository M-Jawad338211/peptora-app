'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Check, Lock, Mail, TriangleAlert } from 'lucide-react'
import { billing as billingApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { useSession } from '@/lib/auth/session'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import Markdown from './Markdown'
import HowItWorks from './HowItWorks'
import ClaimForm from './ClaimForm'
import ClaimStatus from './ClaimStatus'

const INCLUDED = [
  'Full peptide encyclopedia and stacks',
  'Reconstitution and syringe calculator',
  'Saved protocols with dose scheduling',
  'Cycle tracker and dose history',
  'Every future update, at no extra cost',
]

/**
 * The paywall, the payment instructions and the claim status, in one place.
 *
 * This is the only product screen a user without a licence can reach, so it
 * has to answer everything at once: what it costs, how to pay, what happens
 * next, and where their existing payment got to.
 */
export default function Billing() {
  const { user } = useSession()
  const [forceForm, setForceForm] = useState(false)

  const info = useQuery({
    queryKey: qk.billingInstructions,
    queryFn: billingApi.instructions,
    staleTime: 5 * 60_000,
  })

  const claims = useQuery({
    queryKey: qk.billingClaims,
    queryFn: billingApi.myClaims,
  })

  if (info.isPending || claims.isPending) {
    return (
      <div className="mx-auto max-w-[640px] space-y-3">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-[180px]" />
        <Skeleton className="h-[240px]" />
      </div>
    )
  }

  const cfg = info.data
  const latest = claims.data?.[0] ?? null
  const isPending = latest?.status === 'submitted' || latest?.status === 'under_review'
  const hasAccess = !!user?.access?.has_access

  // Show the form when there is nothing in flight, or when a rejected user
  // has chosen to correct and resend.
  const showForm =
    cfg?.manual_payments_enabled &&
    !hasAccess &&
    !user?.access?.is_revoked &&
    (forceForm || (!isPending && latest?.status !== 'approved'))

  return (
    <div className="mx-auto max-w-[640px]">
      <header className="mb-6 text-center">
        {!hasAccess && (
          <Lock size={34} strokeWidth={1.4} aria-hidden="true" className="mx-auto mb-3 text-tx3" />
        )}
        <h1 className="mb-2 text-[28px] font-extrabold leading-tight text-tx">
          {hasAccess ? 'Your Peptora licence' : 'Unlock Peptora'}
        </h1>
        <p className="mx-auto max-w-[46ch] text-sm leading-6 text-tx3-body">
          {hasAccess
            ? 'You own Peptora outright. There is no renewal and nothing to cancel.'
            : user?.access?.is_revoked
              ? 'Get in touch and we will sort this out with you.'
              : 'One payment. Buy it once and it is yours — no subscription, no recurring charge, nothing to cancel.'}
        </p>
      </header>

      {/* Revocation outranks everything, including an approved claim. Without
          this the ClaimStatus below would cheerfully tell someone who has been
          cut off that their licence is active. */}
      {user?.access?.is_revoked && (
        <div className="card mb-3 flex items-start gap-3 border-danger/30 p-4">
          <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-[13px] font-semibold text-tx">Access withdrawn</p>
            <p className="mt-0.5 text-[12px] leading-5 text-tx3-body">
              Your access to Peptora has been withdrawn. Email{' '}
              <a href={`mailto:${cfg.support_email}`} className="text-teal">
                {cfg.support_email}
              </a>{' '}
              and we will look into it with you.
            </p>
          </div>
        </div>
      )}

      {hasAccess && user?.access?.is_lifetime && (
        <div className="card mb-3 flex items-start gap-3 border-teal/30 p-4">
          <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
          <div>
            <p className="text-[13px] font-semibold text-tx">Licence active</p>
            <p className="mt-0.5 text-[12px] leading-5 text-tx3-body">
              Every tool is unlocked, permanently.
            </p>
          </div>
        </div>
      )}

      {latest && !showForm && !user?.access?.is_revoked && (
        <div className="mb-3">
          <ClaimStatus
            claim={latest}
            slaHours={cfg?.review_sla_hours}
            onResubmit={() => setForceForm(true)}
          />
        </div>
      )}

      {!hasAccess && !user?.access?.is_revoked && (
        <>
          {/* Price */}
          <section className="card mb-3 p-5 text-center">
            <p className="font-mono text-[11px] uppercase tracking-wide text-tx3-body">
              One-time purchase
            </p>
            <p className="mt-2 text-[44px] font-extrabold leading-none text-tx">
              {cfg.currency === 'USD' ? '$' : ''}
              {cfg.price}
              {cfg.currency !== 'USD' && (
                <span className="ml-2 text-[18px] font-bold text-tx2">{cfg.currency}</span>
              )}
            </p>
            <p className="mt-2 text-[12px] text-tx3-body">Paid once. Yours permanently.</p>
          </section>

          {cfg.manual_payments_enabled && (
            <HowItWorks price={cfg.price} currency={cfg.currency} slaHours={cfg.review_sla_hours} />
          )}

          {!cfg.manual_payments_enabled && (
            <p className="card mb-3 flex items-start gap-2.5 border-warn/30 p-4 text-[13px] leading-5 text-tx3-body">
              <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-warn" />
              Payments are temporarily closed. Email{' '}
              <a href={`mailto:${cfg.support_email}`} className="text-teal">
                {cfg.support_email}
              </a>{' '}
              and we will sort it out directly.
            </p>
          )}

          {cfg.manual_payments_enabled && (
            <>
              {/* Bank details */}
              <section id="bank-details" className="card mb-3 scroll-mt-4 p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <Building2 size={16} aria-hidden="true" className="shrink-0 text-tx3-body" />
                  <h2 className="font-mono text-[11px] uppercase tracking-wide text-tx3-body">
                    Where to send it
                  </h2>
                </div>
                <Markdown source={cfg.bank_details_md} />
              </section>

              <section className="card mb-3 p-5">
                <Markdown source={cfg.payment_instructions_md} />
              </section>
            </>
          )}

          {showForm && (
            <div className="mb-3">
              <ClaimForm
                price={cfg.price}
                currency={cfg.currency}
                slaHours={cfg.review_sla_hours}
                onDone={() => setForceForm(false)}
              />
            </div>
          )}

          {/* The second payment path from the brief: email us, we send a link.
              Deliberately given equal weight — for some people a transfer is
              not an option, and burying this loses the sale. */}
          <section className="card mb-3 flex items-start gap-3 p-5">
            <Mail size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-tx3-body" />
            <div className="text-[12.5px] leading-6 text-tx3-body">
              <p className="mb-1 text-[13px] font-semibold text-tx2">
                Cannot make a bank transfer?
              </p>
              <p>
                Email{' '}
                <a href={`mailto:${cfg.support_email}`} className="text-teal">
                  {cfg.support_email}
                </a>{' '}
                from the address on this account and we will send you a payment
                link instead. Mention your account email so we can find you.
              </p>
            </div>
          </section>
        </>
      )}

      <section className="card mb-3 p-5">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-tx3-body">
          What you get
        </p>
        <ul className="space-y-2.5">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
              <span className="text-[13px] leading-5 text-tx2">{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="card p-4 text-[12px] leading-5 italic text-tx3-body">
        Peptora is for research and educational use only. Nothing here
        constitutes medical advice. Always consult a qualified healthcare
        professional.
      </p>
    </div>
  )
}
