'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth, ApiError } from '@/lib/api'
import { countLabel, errorText, onlyDigits } from '@/lib/account'
import { safeNext } from '@/lib/safe-next'
import AuthCard from '@/components/auth/AuthCard'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

// At or below this many recovery codes the user is told to get new ones.
const LOW_RECOVERY_CODES = 3

// A real navigation, not a client one (see the comment in signIn). Kept out of
// the component so the lint rule about writing to globals from a handler that
// is handed to a child component has nothing to object to.
function hardNavigate(url) {
  window.location.href = url
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Second step, for an account with two-factor authentication on. The email
  // and password stay in state while the code is asked for: the request is
  // sent again with the code added, and nothing is stored anywhere else.
  const [step, setStep] = useState('credentials') // credentials | code | recovery-used
  const [useRecovery, setUseRecovery] = useState(false)
  const [code, setCode] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [remaining, setRemaining] = useState(null)
  const submittedFor = useRef(null)

  const router = useRouter()
  const params = useSearchParams()

  // Validated before use — see lib/safe-next.js for why an unchecked
  // `next` is an open redirect once this hard-navigates.
  const next = safeNext(params.get('next'))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await signIn()
  }

  const signIn = async (second = {}) => {
    setError('')
    setLoading(true)
    try {
      const data = await auth.login({ email, password, ...second })

      // An unverified account gets a 200 with no session and a freshly
      // re-sent OTP — not an error. Route to the OTP screen.
      if (data.requires_verification) {
        router.replace(
          `/app/auth/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`
        )
        return
      }

      // Signed in with a recovery code: say how many are left before moving
      // on. The session is already set, so Continue is an ordinary hard
      // navigation, the same as below.
      if (data.two_factor === 'recovery_code' && typeof data.recovery_codes_remaining === 'number') {
        setRemaining(data.recovery_codes_remaining)
        setStep('recovery-used')
        setLoading(false)
        return
      }

      // A soft navigation (router.replace) fetches the RSC payload for `next`
      // through Next's client Router Cache, which is keyed by URL alone. If
      // this browser tab visited `next` earlier while signed out, that cache
      // entry holds the REDIRECT (shell)/layout.js threw back then — and
      // replaying it bounces straight back to /app/auth/login regardless of
      // how fresh the session cookie now is. A hard navigation forces a real
      // request, so the server re-reads the cookie it just set and the
      // gated layout sees the real, current session. Same reasoning as the
      // checkout redirect in components/billing/Billing.js.
      hardNavigate(next)
    } catch (err) {
      submittedFor.current = null
      if (err instanceof ApiError && err.code === 'two_factor_required') {
        // The password was right; the account wants its second step.
        setStep('code')
      } else if (step === 'code' && err instanceof ApiError && !err.code?.startsWith('two_factor_') && err.status === 401) {
        // Something other than the code was refused (the password was changed
        // in the meantime). Back to the first step, with the reason.
        backToLogin()
        setError(err.message)
      } else {
        // A wrong or locked code reads as the server wrote it, under the
        // field, and the code stays in the field.
        setError(errorText(err, 'Invalid email or password'))
      }
      setLoading(false)
    }
  }

  const backToLogin = () => {
    setStep('credentials')
    setUseRecovery(false)
    setCode('')
    setRecoveryCode('')
    // The password is not kept once the user steps back; the email is.
    setPassword('')
    setError('')
    submittedFor.current = null
  }

  const handleCodeChange = (e) => {
    const value = onlyDigits(e.target.value)
    setCode(value)
    setError('')
    // Auto-submit on the sixth digit, guarded so a re-render cannot resubmit
    // the same code: a wrong one counts towards the lock.
    if (value.length === 6 && submittedFor.current !== value && !loading) {
      submittedFor.current = value
      signIn({ totpCode: value })
    }
  }

  const handleSecondSubmit = (e) => {
    e.preventDefault()
    if (loading) return
    if (useRecovery) {
      if (recoveryCode.trim()) signIn({ recoveryCode: recoveryCode.trim() })
    } else if (code.length === 6) {
      submittedFor.current = code
      signIn({ totpCode: code })
    }
  }

  const switchMethod = () => {
    setUseRecovery((v) => !v)
    setError('')
    submittedFor.current = null
  }

  if (step === 'recovery-used') {
    const low = remaining <= LOW_RECOVERY_CODES
    return (
      <AuthCard
        title="You are signed in"
        subtitle="You used a recovery code. It cannot be used again."
      >
        <p
          role="status"
          className={`mb-5 text-center text-2xl font-extrabold ${
            remaining === 0 ? 'text-danger-text' : low ? 'text-warn' : 'text-teal'
          }`}
        >
          {countLabel(remaining, 'recovery code')} left
        </p>
        {low && (
          <p className="mb-5 text-[13px] leading-5 text-tx3-body">
            {remaining === 0
              ? 'You have no recovery codes left. If you lose your authenticator app now, you will not be able to sign in. Get new codes in your security settings.'
              : 'You are running low. Get new codes in your security settings before they run out.'}
          </p>
        )}
        <div className="space-y-2.5">
          <Button
            type="button"
            fullWidth
            onClick={() => hardNavigate(next)}
          >
            Continue
          </Button>
          {low && (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => hardNavigate('/app/profile?tab=security')}
            >
              Get new recovery codes
            </Button>
          )}
        </div>
      </AuthCard>
    )
  }

  if (step === 'code') {
    return (
      <AuthCard
        title="Enter your code"
        subtitle={
          useRecovery
            ? 'Enter one of the recovery codes you saved. Each one works once.'
            : 'Open your authenticator app and enter the 6-digit code for Peptora.'
        }
        footer={
          <button
            type="button"
            onClick={backToLogin}
            disabled={loading}
            className="tap px-3 text-tx3-body disabled:opacity-50"
          >
            Back to login
          </button>
        }
      >
        <form onSubmit={handleSecondSubmit} noValidate>
          {useRecovery ? (
            <Field
              key="recovery"
              label="Recovery code"
              name="recovery_code"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              required
              value={recoveryCode}
              onChange={(e) => {
                setRecoveryCode(e.target.value)
                setError('')
              }}
              placeholder="xxxxx-xxxxx"
              error={error}
              className="mb-2"
              inputClassName="text-center font-mono text-lg tracking-wide"
            />
          ) : (
            <Field
              key="totp"
              label="6-digit code"
              name="totp_code"
              // Lets iOS/Android offer the code straight from the keyboard.
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              required
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              error={error}
              className="mb-2"
              inputClassName="text-center text-2xl font-bold tracking-[8px]"
            />
          )}

          <div className="mb-5 text-right">
            <button
              type="button"
              onClick={switchMethod}
              disabled={loading}
              className="tap px-1 font-mono text-[11px] text-tx3-body disabled:opacity-50"
            >
              {useRecovery ? 'Use the authenticator code instead' : 'Use a recovery code instead'}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading || (useRecovery ? !recoveryCode.trim() : code.length !== 6)}
            fullWidth
          >
            {loading ? 'Logging in' : 'Log in'}
          </Button>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your Peptora account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/app/auth/signup" className="text-teal no-underline">
            Sign up free
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mb-3.5"
        />
        <Field
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mb-2"
        />

        <div className="mb-5 text-right">
          <Link
            href="/app/auth/forgot-password"
            className="font-mono text-[11px] text-tx3-body no-underline"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="mb-3.5 text-[13px] text-danger-text">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Logging in' : 'Log in'}
        </Button>
      </form>
    </AuthCard>
  )
}
