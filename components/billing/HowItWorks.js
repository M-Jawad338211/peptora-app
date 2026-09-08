import { CircleCheck, FileClock, Send, Upload } from 'lucide-react'

/**
 * The four-step mechanism, spelled out independently of whatever an admin
 * writes into `bank_details_md` / `payment_instructions_md`.
 *
 * Those two fields cover the specifics — which bank, what reference format —
 * but the shape of the process itself (send → submit → wait → unlock) should
 * never depend on an admin remembering to explain it well. This is the part
 * that answers "how do I actually activate this" on its own, every time.
 */
const STEPS = [
  {
    icon: Send,
    title: 'Send the payment',
    body: (price) =>
      `Transfer ${price} to the account shown below. Use your own bank app or branch — Peptora never asks for card details.`,
  },
  {
    icon: Upload,
    title: 'Tell us about it here',
    body: () =>
      'Come back to this page and submit the transaction reference, the amount and date you sent, and a screenshot or PDF of the receipt.',
  },
  {
    icon: FileClock,
    title: 'We check it by hand',
    body: (_price, window) =>
      `A person compares your receipt against the transfer — there is no automatic gateway to do this instantly. It usually takes ${window}.`,
  },
  {
    icon: CircleCheck,
    title: 'Your licence activates',
    body: () =>
      'The moment it is approved you get an email, and the app unlocks on its own — no code to enter, nothing else to do. Keep this tab open or close it; either way works.',
  },
]

export default function HowItWorks({ price, currency, slaHours = 24 }) {
  const window = slaHours >= 24 ? 'about one business day' : `about ${slaHours} hours`
  const priceLabel = `${currency === 'USD' ? '$' : ''}${price}${currency !== 'USD' ? ` ${currency}` : ''}`

  return (
    <section className="card mb-3 p-5">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-wide text-tx3-body">
        How to activate your licence
      </p>
      <ol className="flex flex-col gap-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <li key={step.title} className="flex gap-3.5">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-teal/25 bg-teal/10 font-mono text-[12px] font-semibold text-teal"
              >
                {i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="flex items-center gap-2 text-[13.5px] font-semibold text-tx">
                  <Icon size={14} aria-hidden="true" className="shrink-0 text-tx3-body" />
                  {step.title}
                </p>
                <p className="mt-1 text-[13px] leading-6 text-tx3-body">
                  {step.body(priceLabel, window)}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
