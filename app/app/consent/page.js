'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { auth } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { useLogout } from '@/lib/auth/session'
import Button from '@/components/ui/Button'

/**
 * Consent interstitial, ported from peptora-android/app/consent.js.
 * Copy is reproduced verbatim — it is a legal agreement.
 */
const SECTIONS = [
  {
    title: 'Research Use Only',
    body: 'Peptora is intended solely for informational and research purposes. All content and calculations are for educational use only and do not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making any decisions about peptide use.',
  },
  {
    title: 'No Medical Advice',
    body: 'Nothing in this app should be interpreted as medical advice. The dosage calculations and peptide information provided are based on publicly available research and are not reviewed or approved by the FDA or any other regulatory authority.',
  },
  {
    title: 'Age Requirement',
    body: 'You must be at least 18 years of age to use Peptora. By accepting these terms you confirm that you meet this age requirement.',
  },
  {
    title: 'Assumption of Risk',
    body: 'Use of peptides carries inherent risks. Peptora assumes no liability for any harm, injury, or adverse effects resulting from the use of information provided in this app. You use this app entirely at your own risk.',
  },
  {
    title: 'Privacy',
    body: 'We collect your email, usage data, and cycle logs solely to provide and improve the Peptora service. We do not sell your data to third parties.',
  },
  {
    title: 'Changes to Terms',
    body: 'Peptora reserves the right to update these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.',
  },
]

export default function ConsentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDecline, setConfirmDecline] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const logout = useLogout()

  const handleAccept = async () => {
    setError('')
    setLoading(true)
    try {
      await auth.acceptConsent()
      await queryClient.invalidateQueries({ queryKey: qk.session })
      router.replace('/app/home')
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
          {loading ? 'Saving…' : 'I agree and continue'}
        </Button>

        {confirmDecline ? (
          <div className="mt-4 rounded-[12px] border border-danger/25 bg-danger/8 p-4">
            <p className="mb-3 text-sm leading-6 text-tx2">
              Declining signs you out. You can still browse the encyclopedia
              and use the calculator without an account.
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
