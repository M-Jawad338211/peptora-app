'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/api'
import { generateFingerprint } from '@/lib/fingerprint'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fingerprint, setFingerprint] = useState('')
  const router = useRouter()

  useEffect(() => { generateFingerprint().then(setFingerprint) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await auth.register(email, password, fullName, fingerprint)
      router.push('/dashboard?welcome=1')
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
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
          Create your account
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', marginBottom: '28px' }}>
          Free forever. No credit card required.
        </p>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'FULL NAME', type: 'text', value: fullName, set: setFullName, placeholder: 'Optional', required: false },
            { label: 'EMAIL', type: 'email', value: email, set: setEmail, placeholder: 'you@example.com', required: true },
            { label: 'PASSWORD', type: 'password', value: password, set: setPassword, placeholder: '8+ characters', required: true },
          ].map(({ label, type, value, set, placeholder, required }) => (
            <div key={label} style={{ marginBottom: '14px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)} required={required}
                placeholder={placeholder}
                style={{
                  width: '100%', background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px', padding: '13px', color: 'var(--tx)',
                  fontFamily: 'var(--font-sans)', fontSize: '15px', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

          {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '14px', fontFamily: 'var(--font-sans)' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '15px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
            color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '15px',
            fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '6px',
          }}>
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--tx3)', textAlign: 'center', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
