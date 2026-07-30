'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/api'
import { generateFingerprint } from '@/lib/fingerprint'
import AuthCard from '@/components/auth/AuthCard'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fingerprint, setFingerprint] = useState('')
  const router = useRouter()

  useEffect(() => {
    generateFingerprint().then(setFingerprint)
  }, [])

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Enter your name.'
    // Deliberately loose: the API is the authority on address validity, and
    // over-strict client regexes reject valid addresses.
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.'
    }
    if (form.password.length < 8) {
      next.password = 'Use at least 8 characters.'
    }
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Passwords do not match.'
    }
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const found = validate()
    if (Object.keys(found).length) {
      setErrors(found)
      return
    }

    setLoading(true)
    try {
      await auth.register({
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        fullName: form.fullName,
        deviceFingerprint: fingerprint,
      })
      // Registration returns no session — the OTP step is what logs you in.
      router.replace(
        `/app/auth/verify-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`
      )
    } catch (err) {
      setSubmitError(err.message || 'Signup failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create free account"
      subtitle="Verify your email to unlock the app."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/app/auth/login" className="text-teal no-underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          required
          value={form.fullName}
          onChange={set('fullName')}
          error={errors.fullName}
          placeholder="Alex Researcher"
          className="mb-3.5"
        />
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          placeholder="you@example.com"
          className="mb-3.5"
        />
        <Field
          label="Password"
          type="password"
          name="new-password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="At least 8 characters."
          placeholder="••••••••"
          className="mb-3.5"
        />
        <Field
          label="Confirm password"
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          error={errors.confirmPassword}
          placeholder="••••••••"
          className="mb-5"
        />

        {submitError && (
          <p role="alert" className="mb-3.5 text-[13px] text-danger">
            {submitError}
          </p>
        )}

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
