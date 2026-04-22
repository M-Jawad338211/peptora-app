'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import { useAuth } from '@/lib/auth-context'
import { subscriptions, calculator } from '@/lib/api'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [history, setHistory] = useState([])
  const [subStatus, setSubStatus] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      try {
        const [sub, hist] = await Promise.allSettled([
          subscriptions.getStatus(),
          user.plan === 'pro' ? calculator.getHistory() : Promise.resolve([]),
        ])
        if (sub.status === 'fulfilled') setSubStatus(sub.value)
        if (hist.status === 'fulfilled') setHistory(hist.value || [])
      } finally {
        setDataLoading(false)
      }
    }
    loadData()
  }, [user])

  const handlePortal = async () => {
    try {
      const data = await subscriptions.openPortal()
      window.location.href = data.portal_url
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading || !user) return null

  const paymentSuccess = searchParams.get('payment') === 'success'
  const welcome = searchParams.get('welcome') === '1'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />

      {(paymentSuccess || welcome) && (
        <div style={{
          background: 'rgba(0,214,143,0.08)', borderBottom: '1px solid rgba(0,214,143,0.2)',
          padding: '12px 28px', textAlign: 'center',
          fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--teal)',
        }}>
          {paymentSuccess ? '🎉 Welcome to Peptora Pro! Your subscription is now active.' : '👋 Welcome to Peptora! You have 25 free calculations to start.'}
        </div>
      )}

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 28px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: 'var(--tx)', fontWeight: 400, marginBottom: '32px', letterSpacing: '-0.5px' }}>
          Dashboard
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {/* Account card */}
          <div style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '12px' }}>ACCOUNT</div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--tx)', marginBottom: '4px' }}>{user.full_name || 'Researcher'}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--tx2)', marginBottom: '14px' }}>{user.email}</p>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px 12px', borderRadius: '20px',
              background: user.plan === 'pro' ? 'rgba(0,214,143,0.10)' : 'rgba(255,255,255,0.06)',
              color: user.plan === 'pro' ? 'var(--teal)' : 'var(--tx2)',
              border: user.plan === 'pro' ? '1px solid rgba(0,214,143,0.22)' : '1px solid rgba(255,255,255,0.1)',
            }}>
              {user.plan === 'pro' ? '⭐ Pro' : 'Free'}
            </span>
          </div>

          {/* Trial / subscription card */}
          <div style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '12px' }}>
              {user.plan === 'pro' ? 'SUBSCRIPTION' : 'USAGE'}
            </div>
            {user.plan === 'pro' ? (
              <>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--teal)', marginBottom: '6px' }}>Unlimited access</p>
                {subStatus?.current_period_end && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', marginBottom: '14px' }}>
                    Renews {new Date(subStatus.current_period_end).toLocaleDateString()}
                    {subStatus.cancel_at_period_end && ' (cancels at end of period)'}
                  </p>
                )}
                <button onClick={handlePortal} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx2)',
                  background: 'var(--sl)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '7px', padding: '7px 14px', cursor: 'pointer',
                }}>Manage billing →</button>
              </>
            ) : (
              <>
                {user.trial_count && (
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--tx)', marginBottom: '6px' }}>
                    {25 - (user.trial_count.anonymous_uses + user.trial_count.free_uses)} of 25 calculations remaining
                  </p>
                )}
                <a href="/pricing" style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--teal)', textDecoration: 'none',
                }}>Upgrade to Pro →</a>
              </>
            )}
          </div>
        </div>

        {/* Calculation history (Pro only) */}
        {user.plan === 'pro' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--tx)', fontWeight: 600, marginBottom: '16px' }}>
              Recent calculations
            </h2>
            {dataLoading ? (
              <p style={{ color: 'var(--tx3)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Loading…</p>
            ) : history.length === 0 ? (
              <div style={{
                background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '12px', padding: '32px', textAlign: 'center',
              }}>
                <p style={{ color: 'var(--tx3)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
                  No calculations yet. <a href="/calculator" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Try the calculator →</a>
                </p>
              </div>
            ) : (
              <div style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', overflow: 'hidden' }}>
                {history.map((h, i) => (
                  <div key={h.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px',
                    padding: '12px 20px', alignItems: 'center',
                    borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--tx)' }}>{h.peptide_name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)' }}>{h.vial_mg}mg</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)' }}>{h.target_mcg}mcg</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--teal)' }}>{h.result_units.toFixed(1)}u</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', textAlign: 'right' }}>
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
