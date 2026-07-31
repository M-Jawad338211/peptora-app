'use client'

import { useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/api'
import AuthCard from '@/components/auth/AuthCard'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await auth.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const backToLogin = (
    <Link href="/app/auth/login" className="text-tx3-body no-underline">
      ← Back to login
    </Link>
  )

  if (sent) {
    return (
      <AuthCard title="Check your email" footer={backToLogin}>
        <p className="text-sm leading-6 text-tx2">
          If <span className="text-tx">{email.trim().toLowerCase()}</span> is
          registered, a password reset link is on its way. The link expires in
          one hour.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to set a new password."
      footer={backToLogin}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={error}
          className="mb-5"
        />
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthCard>
  )
}
