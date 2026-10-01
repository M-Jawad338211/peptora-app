import Link from 'next/link'
import { BookOpen, Calculator, ChartLine, FlaskConical } from 'lucide-react'
import { DISCLAIMER, TAGLINE } from '@/lib/site'

export const metadata = {
  title: 'Peptora: peptide tracking and reference',
  description:
    'Keep track of your peptide protocols and your log. A cited reference library and a reconstitution calculator are included free.',
}

// What Peptora is made of, and which parts need Peptora Pro. The library and
// the calculator are free in the app and on the web alike.
const PARTS = [
  {
    icon: FlaskConical,
    label: 'Protocols',
    desc: 'Save each vial with the schedule you set for it.',
    tier: 'Pro',
  },
  {
    icon: ChartLine,
    label: 'Log and history',
    desc: 'Log an entry in one tap and look back over what you recorded.',
    tier: 'Pro',
  },
  {
    icon: BookOpen,
    label: 'Peptide library',
    desc: 'Reference entries written from published sources, each one listed and linked.',
    tier: 'Free',
  },
  {
    icon: Calculator,
    label: 'Reconstitution calculator',
    desc: 'Converts the numbers you enter between amount, volume and syringe units.',
    tier: 'Free',
  },
]

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-[860px] px-7 pt-20 pb-14 text-center">
        <p className="mb-7 inline-block rounded-full border border-teal/25 bg-teal/8 px-4 py-1.5 font-mono text-[12px] tracking-[0.04em] text-teal">
          {TAGLINE}
        </p>

        <h1 className="mb-6 font-display text-[clamp(38px,6.5vw,72px)] leading-[1.02] tracking-[-1.5px] text-tx">
          Keep track of your
          <br />
          <span className="text-teal">peptide protocols.</span>
        </h1>

        <p className="mx-auto mb-10 max-w-[560px] text-[18px] leading-8 font-light text-tx2">
          Peptora records the schedule you set and keeps your log. The
          reference library cites its sources, and the calculator works only
          on numbers you enter.
        </p>

        <div className="flex flex-wrap justify-center gap-3.5">
          <Link
            href="/app/auth/signup"
            className="rounded-[13px] bg-teal px-9 py-4 text-base font-semibold text-on-teal no-underline transition-colors hover:bg-teal-dark"
          >
            Create an account
          </Link>
          <Link
            href="/app/auth/login"
            className="rounded-[13px] border border-hairline-strong bg-inset px-9 py-4 text-base text-tx2 no-underline transition-colors hover:text-tx"
          >
            Log in
          </Link>
        </div>

        <p className="mx-auto mt-7 max-w-[520px] text-[13.5px] leading-6 text-tx3-body">
          The library and the calculator are free. Protocols, the log and your
          history are part of Peptora Pro, and a new account on the web starts
          with 14 days of Pro.
        </p>
      </section>

      <section
        aria-label="What is in Peptora"
        className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5 px-7 pb-20"
      >
        {PARTS.map(({ icon: Icon, label, desc, tier }) => (
          <div key={label} className="card rounded-[16px] p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-[12px] border border-teal/25 bg-teal/10">
                <Icon size={21} aria-hidden="true" className="text-teal" strokeWidth={1.8} />
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium ${
                  tier === 'Free'
                    ? 'border-hairline-strong text-tx2'
                    : 'border-teal/25 bg-teal/10 text-teal'
                }`}
              >
                {tier}
              </span>
            </div>
            <h2 className="mb-1.5 text-base font-semibold text-tx">{label}</h2>
            <p className="text-[13.5px] leading-6 font-light text-tx2">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-hairline px-7 py-6 text-center text-[12px] leading-6 text-tx3-body">
        <p className="mx-auto max-w-[640px]">{DISCLAIMER}</p>
        <p className="mt-2 flex justify-center gap-5">
          <Link href="/privacy-policy" className="text-tx2 no-underline hover:text-tx">
            Privacy Policy
          </Link>
          <Link href="/support" className="text-tx2 no-underline hover:text-tx">
            Support
          </Link>
        </p>
      </footer>
    </>
  )
}
