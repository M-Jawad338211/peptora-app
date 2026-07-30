'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/api'
import AuthCard from '@/components/auth/AuthCard'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

function ResetPasswordForm() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <AuthCard
        title="Link not valid"
        subtitle="This reset link is missing its token or has already been used."
      >
        <Button href="/app/auth/forgot-password" fullWidth>
          Request a new link
        </Button>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard title="Password updated">
        <p className="mb-5 text-sm leading-6 text-tx2">
          You can now log in with your new password.
        </p>
        <Button href="/app/auth/login" fullWidth>
          Go to login
        </Button>
      </AuthCard>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const found = {}
    if (password.length < 8) found.password = 'Use at least 8 characters.'
    if (confirmPassword !== password) found.confirm = 'Passwords do not match.'
    if (Object.keys(found).length) {
      setErrors(found)
      return
    }

    setLoading(true)
    try {
      await auth.resetPassword({ token, newPassword: password })
      // Show a real confirmation rather than bouncing on a timer, so the
      // outcome is never missed.
      setDone(true)
    } catch (err) {
      setSubmitError(
        err.message || 'Invalid or expired reset link. Request a new one.'
      )
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Set a new password"
      footer={
        <Link href="/app/auth/login" className="text-tx3-body no-underline">
          ← Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((p) => ({ ...p, password: undefined }))
          }}
          error={errors.password}
          hint="At least 8 characters."
          placeholder="••••••••"
          className="mb-3.5"
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setErrors((p) => ({ ...p, confirm: undefined }))
          }}
          error={errors.confirm}
          placeholder="••••••••"
          className="mb-5"
        />

        {submitError && (
          <p role="alert" className="mb-3.5 text-[13px] text-danger-text">
            {submitError}
          </p>
        )}

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
