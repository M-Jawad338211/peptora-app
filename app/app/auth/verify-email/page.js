'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { auth } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import AuthCard from '@/components/auth/AuthCard'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

const RESEND_COOLDOWN_SECONDS = 30

function VerifyEmailForm() {
  const params = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [email, setEmail] = useState(params.get('email') || '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const submittedFor = useRef(null)

  // The API rate-limits resends to 3/minute; a visible countdown beats
  // letting the user hammer the button into a 429.
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const verify = async (code) => {
    setError('')
    setNotice('')
    setLoading(true)
    try {
      await auth.verifyEmail({ email, otp: code })
      // This is the call that actually establishes the session.
      await queryClient.invalidateQueries({ queryKey: qk.session })
      router.replace('/app/home')
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code')
      submittedFor.current = null
      setLoading(false)
    }
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    // Auto-submit on the sixth digit, guarded so a re-render cannot resubmit
    // the same code and burn one of the five allowed attempts.
    if (value.length === 6 && submittedFor.current !== value && email) {
      submittedFor.current = value
      verify(value)
    }
  }

  const handleResend = async () => {
    setError('')
    setNotice('')
    try {
      await auth.resendVerificationOtp(email)
      setNotice('A new code is on its way.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.message || 'Could not send a new code.')
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your email address."
      footer={
        <Link href="/app/auth/login" className="text-tx3-body no-underline">
          ← Back to login
        </Link>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (otp.length === 6) verify(otp)
        }}
        noValidate
      >
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3.5"
        />
        <Field
          label="Verification code"
          // Lets iOS/Android offer the emailed code straight from the keyboard.
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          required
          value={otp}
          onChange={handleOtpChange}
          placeholder="000000"
          error={error}
          className="mb-5"
          inputClassName="text-center text-2xl font-bold tracking-[8px]"
        />

        {notice && (
          <p role="status" className="mb-3.5 text-[13px] text-teal">
            {notice}
          </p>
        )}

        <Button type="submit" disabled={loading || otp.length !== 6} fullWidth>
          {loading ? 'Verifying…' : 'Verify email'}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || !email}
          className="tap px-3 font-mono text-[11px] text-tx3-body disabled:opacity-50"
        >
          {cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}
        </button>
      </div>
    </AuthCard>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}
