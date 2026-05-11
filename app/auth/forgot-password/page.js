'use client'
import { useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/api'

const inputStyle = {
  width: '100%', background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px', padding: '13px', color: 'var(--tx)',
  fontFamily: 'var(--font-sans)', fontSize: '15px', boxSizing: 'border-box',
}

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

        {sent ? (
          <>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'rgba(0,214,143,0.10)', border: '1px solid rgba(0,214,143,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', marginBottom: '20px',
            }}>✉️</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: 'var(--tx)', marginBottom: '10px', fontWeight: 400 }}>
              Check your email
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', lineHeight: 1.6, marginBottom: '28px' }}>
              If <strong style={{ color: 'var(--tx)' }}>{email}</strong> is registered, you&apos;ll receive a password reset link within a few minutes.
            </p>
            <Link href="/auth/login" style={{
              display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px',
              background: 'var(--sl, rgba(255,255,255,0.06))', border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--tx2)', fontFamily: 'var(--font-sans)', fontSize: '15px',
              fontWeight: 500, textDecoration: 'none',
            }}>
              Back to login
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', color: 'var(--tx)', marginBottom: '6px', fontWeight: 400 }}>
              Reset password
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', marginBottom: '28px' }}>
              Enter your email and we&apos;ll send a reset link.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>EMAIL</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@example.com" disabled={loading} style={inputStyle}
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
                {loading ? 'Sending…' : 'Send reset link'}
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
