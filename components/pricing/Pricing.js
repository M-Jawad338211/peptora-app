'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Check, Bitcoin, ShieldCheck, TriangleAlert } from 'lucide-react'
import { subscriptions as subsApi, ApiError } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { useSession } from '@/lib/auth/session'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { AuthPrompt } from '@/components/auth/AuthGate'

const FEATURES = [
  'Unlimited dose calculations',
  'Reconstitution & syringe calculator',
  'Saved protocols with dose scheduling',
  'Cycle tracker and dose history',
  'Full peptide encyclopedia and stacks',
]

function priceLabel(plan) {
  if (plan.id === 'annual') {
    return `$${(plan.price_usd / 12).toFixed(2)}/mo billed yearly`
  }
  return 'per month'
}

function PlanCard({ plan, featured, onSelect, busy, disabled }) {
  return (
    <div
      className={`card relative flex flex-col p-5 ${
        featured ? 'border-teal/40' : ''
      }`}
    >
      {featured && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-gold/15 px-3 py-1 font-mono text-[10px] text-gold">
          Best value — save 18%
        </span>
      )}
      <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-tx3-body">
        {plan.label}
      </p>
      <p className="text-[40px] font-extrabold leading-none text-tx">
        ${plan.price_usd}
      </p>
      <p className="mt-1.5 mb-5 text-[12px] text-tx3-body">{priceLabel(plan)}</p>
      <Button
        onClick={() => onSelect(plan.id)}
        disabled={busy || disabled}
        variant={featured ? 'primary' : 'secondary'}
        fullWidth
        className="mt-auto"
      >
        {busy ? 'Opening checkout…' : `Pay with crypto`}
      </Button>
    </div>
  )
}

function PricingContent() {
  const { user } = useSession()
  const params = useSearchParams()
  const cancelled = params.get('checkout') === 'cancelled'

  const [busyPlan, setBusyPlan] = useState(null)
  const [error, setError] = useState(null)

  const status = useQuery({
    queryKey: qk.subscription,
    queryFn: subsApi.status,
  })

  const access = user?.access
  const plans = status.data?.plans ?? []
  const paymentsEnabled = status.data?.payments_enabled ?? false

  const startCheckout = async (planId) => {
    setBusyPlan(planId)
    setError(null)
    try {
      const { checkout_url } = await subsApi.createCheckout(planId)
      // Hard navigation, not router.push — the invoice is hosted by
      // NOWPayments on another origin, and an installed PWA has to leave the
      // app scope to reach it.
      window.location.href = checkout_url
    } catch (err) {
      setBusyPlan(null)
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not open checkout. Please try again.'
      )
    }
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <header className="mb-6 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold leading-tight text-tx">
          Peptora Pro
        </h1>
        <p className="mx-auto max-w-[44ch] text-sm leading-6 text-tx3-body">
          Every research tool, one plan. Paid in crypto — no card, no stored
          payment details.
        </p>
      </header>

      {access?.has_access && (
        <div className="card mb-4 flex items-start gap-3 border-teal/30 p-4">
          <ShieldCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
          <div>
            <p className="text-[13px] font-semibold text-tx">
              {access.is_trial
                ? `Your trial is active — ${access.days_remaining} day${access.days_remaining === 1 ? '' : 's'} left`
                : `You're subscribed — ${access.days_remaining} day${access.days_remaining === 1 ? '' : 's'} left`}
            </p>
            <p className="mt-0.5 text-[12px] leading-5 text-tx3-body">
              {access.is_trial
                ? 'Subscribing now adds a full period on top of the days you have left — nothing is lost.'
                : 'Paying again extends your access rather than starting a second one.'}
            </p>
          </div>
        </div>
      )}

      {cancelled && (
        <p className="card mb-4 p-3 text-[13px] text-tx3-body">
          Checkout was cancelled — nothing was charged.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="card mb-4 border-danger/30 p-3 text-[13px] text-danger-text"
        >
          {error}
        </p>
      )}

      {!paymentsEnabled && !status.isPending && (
        <p className="card mb-4 flex items-start gap-2.5 border-warn/30 p-3 text-[13px] leading-5 text-tx3-body">
          <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-warn" />
          Checkout is temporarily unavailable. Please try again shortly.
        </p>
      )}

      {status.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-[240px]" />
          <Skeleton className="h-[240px]" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              featured={plan.id === 'annual'}
              busy={busyPlan === plan.id}
              disabled={!paymentsEnabled || (busyPlan && busyPlan !== plan.id)}
              onSelect={startCheckout}
            />
          ))}
        </div>
      )}

      <section className="card mt-3 p-5">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-tx3-body">
          Included in both
        </p>
        <ul className="space-y-2.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
              <span className="text-[13px] leading-5 text-tx2">{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-3 flex items-start gap-3 p-5">
        <Bitcoin size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-tx3-body" />
        <div className="text-[12px] leading-5 text-tx3-body">
          <p className="mb-1.5 font-semibold text-tx2">How crypto billing works</p>
          <p className="mb-1.5">
            Crypto payments cannot be charged automatically, so{' '}
            <strong className="text-tx2">nothing renews on its own</strong>. Your
            access runs for the period you paid for and then simply stops — there
            is no subscription to cancel and no way for us to charge you again.
            We will email you a few days before it ends.
          </p>
          <p>
            The monthly plan is payable in USDT (TRC-20), TRX, LTC, SOL, USDC,
            MATIC and BNB. At $5, network fees on Bitcoin and Ethereum exceed the
            payment itself, so those chains are available on the annual plan only.
          </p>
        </div>
      </section>

      <p className="card mt-3 p-4 text-[12px] leading-5 italic text-tx3-body">
        Peptora is for research and educational use only. Nothing here
        constitutes medical advice. Always consult a qualified healthcare
        professional.
      </p>
    </div>
  )
}

export default function Pricing() {
  const { user, isPending } = useSession()

  if (isPending) {
    return (
      <div className="mx-auto max-w-[720px] space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[240px]" />
      </div>
    )
  }

  // Checkout needs an account to attach the payment to, so send signed-out
  // visitors to sign up rather than showing prices they cannot act on.
  if (!user) {
    return (
      <AuthPrompt
        title="Create an account to subscribe"
        subtitle="New accounts get 14 days of full access, with no payment details required."
      />
    )
  }

  return <PricingContent />
}
