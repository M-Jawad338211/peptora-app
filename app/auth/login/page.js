'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
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

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', color: 'var(--tx)', marginBottom: '6px', fontWeight: 400 }}>
          Welcome back
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', marginBottom: '28px' }}>
          Log in to your Peptora account
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com"
              style={{
                width: '100%', background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', padding: '13px', color: 'var(--tx)',
                fontFamily: 'var(--font-sans)', fontSize: '15px', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: '100%', background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', padding: '13px', color: 'var(--tx)',
                fontFamily: 'var(--font-sans)', fontSize: '15px', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link href="/auth/forgot-password" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '14px', fontFamily: 'var(--font-sans)' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '15px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
            color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '15px',
            fontWeight: 600, border: 'none', cursor: 'pointer',
          }}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--tx3)', textAlign: 'center', marginTop: '24px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
