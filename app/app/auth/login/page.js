'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/api'
import { safeNext } from '@/lib/safe-next'
import AuthCard from '@/components/auth/AuthCard'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()

  // Validated before use — see lib/safe-next.js for why an unchecked
  // `next` is an open redirect once this hard-navigates.
  const next = safeNext(params.get('next'))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await auth.login({ email, password })

      // An unverified account gets a 200 with no session and a freshly
      // re-sent OTP — not an error. Route to the OTP screen.
      if (data.requires_verification) {
        router.replace(
          `/app/auth/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`
        )
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
      window.location.href = next
    } catch (err) {
      setError(err.message || 'Invalid email or password')
      setLoading(false)
    }
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
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthCard>
  )
}
