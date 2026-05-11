'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const inputStyle = {
  width: '100%', background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px', padding: '13px', color: 'var(--tx)',
  fontFamily: 'var(--font-sans)', fontSize: '15px', boxSizing: 'border-box',
}

function VerifyEmailForm() {
  const params = useSearchParams()
  const [email, setEmail] = useState(params.get('email') || '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const { refresh } = useAuth()

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email.')
      return
    }
    setLoading(true)
    try {
      await auth.verifyEmail(email, otp)
      await refresh()
      router.push('/dashboard?welcome=1')
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Try requesting a new one.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setInfo('')
    setResending(true)
    try {
      await auth.resendVerificationOtp(email)
      setInfo('A new code has been sent to your email.')
    } catch (err) {
      setError(err.message || 'Could not resend. Try again in a moment.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '40px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'rgba(0,214,143,0.10)', border: '1px solid rgba(0,214,143,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>🧬</div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', fontWeight: 600, color: 'var(--tx)' }}>
            Peptora<em style={{ color: 'var(--teal)', fontStyle: 'normal' }}>.io</em>
          </span>
        </Link>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', color: 'var(--tx)', marginBottom: '6px', fontWeight: 400 }}>
          Verify your email
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', marginBottom: '28px', lineHeight: 1.6 }}>
          Enter the 6-digit code we sent to your email address.
        </p>

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>EMAIL</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="you@example.com" disabled={loading} style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>VERIFICATION CODE</label>
            <input
              type="text" inputMode="numeric" value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required placeholder="000000" maxLength={6} disabled={loading}
              style={{ ...inputStyle, fontSize: '24px', fontWeight: 700, letterSpacing: '6px', textAlign: 'center' }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--red, #ff5f5f)', fontSize: '13px', marginBottom: '14px', fontFamily: 'var(--font-sans)' }}>
              {error}
            </p>
          )}
          {info && (
            <p style={{ color: 'var(--teal)', fontSize: '13px', marginBottom: '14px', fontFamily: 'var(--font-sans)' }}>
              {info}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '15px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
            color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '15px',
            fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--tx3)', textAlign: 'center', marginTop: '20px' }}>
          Didn&apos;t receive it?{' '}
          <button onClick={handleResend} disabled={resending}
            style={{ color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontFamily: 'var(--font-sans)', padding: 0 }}>
            {resending ? 'Sending…' : 'Send a new code'}
          </button>
        </p>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--tx3)', textAlign: 'center', marginTop: '10px' }}>
          <Link href="/auth/login" style={{ color: 'var(--tx3)', textDecoration: 'none' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  )
}
