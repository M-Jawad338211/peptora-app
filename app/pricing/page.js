'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import { useAuth } from '@/lib/auth-context'
import { subscriptions } from '@/lib/api'
import { useRouter } from 'next/navigation'

const FEATURES = [
  { label: 'Dose calculator', free: true, pro: true },
  { label: 'Calculator uses', free: '25 total', pro: 'Unlimited' },
  { label: 'Peptide encyclopedia (100 peptides)', free: true, pro: true },
  { label: 'Vendor status board', free: true, pro: true },
  { label: 'Regulatory tracker', free: true, pro: true },
  { label: 'AI research assistant', free: false, pro: true },
  { label: 'Peptide stack checker', free: false, pro: true },
  { label: 'Cycle tracker + AI summaries', free: false, pro: true },
  { label: 'Protocol finder (AI)', free: false, pro: true },
  { label: 'Calculator history (last 100)', free: false, pro: true },
]

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(null)

  const handleCheckout = async (plan) => {
    if (!user) {
      router.push('/auth/signup')
      return
    }
    setLoading(plan)
    try {
      const data = await subscriptions.createCheckout(plan)
      window.location.href = data.checkout_url
    } catch (err) {
      setLoading(null)
      alert(err.message || 'Failed to start checkout')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 5vw, 52px)', color: 'var(--tx)', fontWeight: 400, marginBottom: '12px', letterSpacing: '-1px' }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', color: 'var(--tx2)', fontWeight: 300 }}>
            Free tools for everyone. Pro unlocks AI-powered features.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
          {/* Monthly */}
          <div style={{
            background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '20px', padding: '32px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', marginBottom: '16px' }}>PRO MONTHLY</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '48px', color: 'var(--tx)', lineHeight: 1 }}>£9.99</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--tx3)', marginBottom: '28px', marginTop: '4px' }}>per month, cancel anytime</div>
            <button onClick={() => handleCheckout('monthly')} disabled={loading === 'monthly' || user?.plan === 'pro'}
              style={{
                width: '100%', padding: '14px', borderRadius: '11px',
                background: user?.plan === 'pro' ? 'var(--sl)' : 'linear-gradient(135deg, #00d68f, #00f0a0)',
                color: user?.plan === 'pro' ? 'var(--tx3)' : '#021a0e',
                fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600,
                border: 'none', cursor: user?.plan === 'pro' ? 'default' : 'pointer',
              }}>
              {user?.plan === 'pro' ? 'Current plan' : loading === 'monthly' ? 'Loading…' : user ? 'Upgrade now' : 'Get started'}
            </button>
          </div>

          {/* Annual */}
          <div style={{
            background: 'var(--navy2)', border: '1px solid rgba(226,185,106,0.3)',
            borderRadius: '20px', padding: '32px', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(226,185,106,0.15)', border: '1px solid rgba(226,185,106,0.3)',
              borderRadius: '20px', padding: '4px 14px',
              fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gold)',
            }}>Best value — save 34%</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', marginBottom: '16px' }}>PRO ANNUAL</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '48px', color: 'var(--tx)', lineHeight: 1 }}>£79</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--tx3)', marginBottom: '4px', marginTop: '4px' }}>per year · £6.58/mo</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', marginBottom: '24px' }}>
              <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>£119.88</span> — you save £40.88
            </div>
            <button onClick={() => handleCheckout('annual')} disabled={loading === 'annual' || user?.plan === 'pro'}
              style={{
                width: '100%', padding: '14px', borderRadius: '11px',
                background: user?.plan === 'pro' ? 'var(--sl)' : 'linear-gradient(135deg, #00d68f, #00f0a0)',
                color: user?.plan === 'pro' ? 'var(--tx3)' : '#021a0e',
                fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600,
                border: 'none', cursor: user?.plan === 'pro' ? 'default' : 'pointer',
              }}>
              {user?.plan === 'pro' ? 'Current plan' : loading === 'annual' ? 'Loading…' : user ? 'Upgrade now' : 'Get started'}
            </button>
          </div>
        </div>

        {/* Feature table */}
        <div style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)' }}>FEATURE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', textAlign: 'center' }}>FREE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--teal)', textAlign: 'center' }}>PRO</div>
          </div>
          {FEATURES.map((f, i) => (
            <div key={f.label} style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px',
              padding: '13px 24px',
              borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)' }}>{f.label}</span>
              <span style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
                {f.free === true ? <span style={{ color: 'var(--green)' }}>✓</span>
                  : f.free === false ? <span style={{ color: 'var(--tx3)' }}>—</span>
                  : <span style={{ color: 'var(--tx2)' }}>{f.free}</span>}
              </span>
              <span style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
                {f.pro === true ? <span style={{ color: 'var(--teal)' }}>✓</span>
                  : <span style={{ color: 'var(--teal)' }}>{f.pro}</span>}
              </span>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)',
          textAlign: 'center', marginTop: '32px', lineHeight: 1.8,
        }}>
          For research and educational purposes only. Not medical advice.<br />
          Secure payment via Stripe. Cancel anytime from your dashboard.
        </p>
      </div>
    </div>
  )
}
