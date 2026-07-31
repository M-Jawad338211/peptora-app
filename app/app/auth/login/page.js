'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { auth } from '@/lib/api'
import { qk } from '@/lib/query/keys'
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
  const queryClient = useQueryClient()

  const next = params.get('next') || '/app/home'

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

      await queryClient.invalidateQueries({ queryKey: qk.session })
      router.replace(next)
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
