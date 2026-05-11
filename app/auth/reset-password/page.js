'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/api'

const inputStyle = {
  width: '100%', background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px', padding: '13px', color: 'var(--tx)',
  fontFamily: 'var(--font-sans)', fontSize: '15px', boxSizing: 'border-box',
}

function ResetPasswordForm() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <p style={{ color: 'var(--red, #ff5f5f)', fontFamily: 'var(--font-sans)', fontSize: '15px', marginBottom: '20px' }}>
            Invalid or missing reset token.
          </p>
          <Link href="/auth/forgot-password" style={{ color: 'var(--teal)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await auth.resetPassword(token, password)
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 2500)
    } catch (err) {
      setError(err.message || 'Invalid or expired reset link. Request a new one.')
    } finally {
      setLoading(false)
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

        {done ? (
          <>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: 'var(--tx)', marginBottom: '10px', fontWeight: 400 }}>
              Password updated
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', lineHeight: 1.6 }}>
              Your password has been reset. Redirecting you to login…
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', color: 'var(--tx)', marginBottom: '6px', fontWeight: 400 }}>
              Set new password
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', marginBottom: '28px' }}>
              Choose a strong password for your account.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>NEW PASSWORD</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="8+ characters" minLength={8} disabled={loading} style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>CONFIRM PASSWORD</label>
                <input
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  required placeholder="Re-enter password" disabled={loading} style={inputStyle}
                />
              </div>

              {error && (
                <p style={{ color: 'var(--red, #ff5f5f)', fontSize: '13px', marginBottom: '14px', fontFamily: 'var(--font-sans)' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '15px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
                color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '15px',
                fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--tx3)', textAlign: 'center', marginTop: '24px' }}>
              <Link href="/auth/login" style={{ color: 'var(--tx3)', textDecoration: 'none' }}>← Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
