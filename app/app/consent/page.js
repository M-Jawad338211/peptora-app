'use client'

import { useState } from 'react'
import { auth } from '@/lib/api'
import { useLogout } from '@/lib/auth/session'
import Button from '@/components/ui/Button'

/**
 * Consent interstitial. The sections say the same thing, in the same words,
 * as peptora-android/app/consent.js: it is one agreement for one account, so
 * the two must not drift apart.
 */
const SECTIONS = [
  {
    title: 'What Peptora is',
    body: 'Peptora is a tracking and reference tool. It records the schedule you set for yourself and keeps your log. It does not recommend doses, and it does not sell peptides or medication.',
  },
  {
    title: 'Not medical advice',
    body: 'Nothing in Peptora is medical advice, diagnosis or treatment. The library summarises published research and regulatory documents for educational reading, and links to its sources. It has not been reviewed or approved by the FDA or any other regulator. Talk to a qualified clinician about your own protocol.',
  },
  {
    title: 'The calculator',
    body: 'The reconstitution calculator does arithmetic on numbers you enter. It never fills in an amount for you. Check every figure yourself before you rely on it.',
  },
  {
    title: 'Age',
    body: 'You must be at least 18 years old to use Peptora. By accepting these terms you confirm that you are.',
  },
  {
    title: 'Your data',
    body: 'Peptora stores your email address, your protocols and your log so that it can show them to you. It does not sell your data. You can delete your account, and everything stored with it, at any time from Profile.',
  },
  {
    title: 'Changes to these terms',
    body: 'These terms may be updated. Continuing to use Peptora after a change means you accept the updated terms.',
  },
]

export default function ConsentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDecline, setConfirmDecline] = useState(false)
  const logout = useLogout()

  const handleAccept = async () => {
    setError('')
    setLoading(true)
    try {
      await auth.acceptConsent()
      // Hard navigation, not router.replace. The Client Router Cache is keyed
      // by URL, and this tab almost certainly already visited /app/home once
      // this session — the moment before consent was accepted, when
      // (shell)/layout.js threw redirect('/app/consent'). A soft navigation
      // can replay that cached redirect and bounce straight back here even
      // though the server-side consent_accepted flag is now true, which is
      // exactly the "accepting doesn't take me anywhere" loop. A hard
      // navigation forces a fresh request, so the layout re-reads the real,
      // current session instead of a stale cached verdict.
      window.location.href = '/app/home'
    } catch (err) {
      // Native leaves the user on an infinite spinner if this fails. Show the
      // error and let them retry.
      setError(err.message || 'Could not save your acceptance. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[680px] flex-col bg-navy px-5 py-10">
      <header className="mb-6">
        <p className="mb-2 text-[22px] font-extrabold tracking-[1px] text-teal">
          Peptora
        </p>
        <h1 className="mb-1.5 text-[22px] font-bold text-tx">Terms of Use</h1>
        <p className="text-sm text-tx3-body">
          Please read and accept before continuing
        </p>
      </header>

      <div className="flex-1 space-y-3">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card p-4">
            <h2 className="mb-2 font-mono text-[13px] font-bold tracking-[0.5px] text-teal uppercase">
              {s.title}
            </h2>
            <p className="text-sm leading-6 text-tx2">{s.body}</p>
          </section>
        ))}
      </div>

      <footer className="mt-6 border-t border-hairline pt-5">
        {error && (
          <p role="alert" className="mb-3 text-[13px] text-danger-text">
            {error}
          </p>
        )}

        <Button onClick={handleAccept} disabled={loading} size="lg" fullWidth>
          {loading ? 'Saving' : 'I agree and continue'}
        </Button>

        {confirmDecline ? (
          <div className="mt-4 rounded-[12px] border border-danger/25 bg-danger/8 p-4">
            <p className="mb-3 text-sm leading-6 text-tx2">
              An account needs these terms accepted. Declining signs you
              out.
            </p>
            <div className="flex gap-2">
              <Button onClick={logout} variant="danger" size="sm">
                Decline &amp; sign out
              </Button>
              <Button
                onClick={() => setConfirmDecline(false)}
                variant="secondary"
                size="sm"
              >
                Keep my account
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDecline(true)}
            disabled={loading}
            className="tap mt-3 w-full text-sm text-tx3-body"
          >
            Decline &amp; sign out
          </button>
        )}
      </footer>
    </main>
  )
}
