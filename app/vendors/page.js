import Nav from '@/components/Nav'

const VENDORS = [
  { name: 'Peptide Sciences', status: 'Active', coa: true, lastChecked: '2026-04-01', notes: 'HPLC tested, US-based' },
  { name: 'Amino Asylum', status: 'Active', coa: true, lastChecked: '2026-04-01', notes: 'Wide selection' },
  { name: 'Limitless Life Nootropics', status: 'Active', coa: true, lastChecked: '2026-03-15', notes: 'COA available on request' },
  { name: 'Core Peptides', status: 'Active', coa: true, lastChecked: '2026-04-01', notes: 'Third-party tested' },
  { name: 'Swiss Chems', status: 'Active', coa: true, lastChecked: '2026-03-20', notes: 'International shipping' },
  { name: 'Behemoth Labz', status: 'Caution', coa: false, lastChecked: '2026-02-01', notes: 'COA inconsistencies reported' },
  { name: 'RC Peptides', status: 'Caution', coa: false, lastChecked: '2026-01-15', notes: 'Limited COA availability' },
  { name: 'Biotech Peptides', status: 'Shutdown', coa: false, lastChecked: '2025-11-01', notes: 'No longer operational' },
]

const STATUS_STYLES = {
  Active: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', color: '#22c55e' },
  Caution: { bg: 'rgba(226,185,106,0.1)', border: 'rgba(226,185,106,0.25)', color: '#e2b96a' },
  Shutdown: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#ef4444' },
  Scam: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#ef4444' },
}

export const metadata = {
  title: 'Vendor Status Board — Peptora',
  description: 'Live trust scores and COA tracking for peptide research chemical vendors.',
}

export default function VendorsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 28px 80px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 400, color: 'var(--tx)', marginBottom: '8px', letterSpacing: '-1px' }}>
          Vendor Status Board
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--tx2)', marginBottom: '36px', fontWeight: 300 }}>
          Community-sourced vendor trust signals and COA availability. Updated regularly.
        </p>

        <div style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 100px 60px 120px 1fr',
            padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.09)',
          }}>
            {['VENDOR', 'STATUS', 'COA', 'LAST CHECKED', 'NOTES'].map(h => (
              <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)' }}>{h}</div>
            ))}
          </div>

          {VENDORS.map((v, i) => {
            const s = STATUS_STYLES[v.status] || STATUS_STYLES.Caution
            return (
              <div key={v.name} style={{
                display: 'grid', gridTemplateColumns: '2fr 100px 60px 120px 1fr',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < VENDORS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx)', fontWeight: 500 }}>{v.name}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '4px 10px', borderRadius: '20px',
                  background: s.bg, border: `1px solid ${s.border}`, color: s.color, display: 'inline-block',
                }}>{v.status}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: v.coa ? 'var(--green)' : 'var(--tx3)' }}>
                  {v.coa ? '✓' : '—'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)' }}>{v.lastChecked}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--tx2)' }}>{v.notes}</span>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {Object.entries(STATUS_STYLES).map(([status, s]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: s.color, boxShadow: `0 0 6px ${s.color}`,
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)' }}>{status}</span>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(226,185,106,0.06)', border: '1px solid rgba(226,185,106,0.15)',
          borderRadius: '12px', padding: '16px 20px',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#e2b96a', lineHeight: 1.7, margin: 0 }}>
            ⚠ Peptora does not endorse any vendor. This board is for informational purposes only. Always verify COAs independently
            and consult applicable laws in your jurisdiction before purchasing research chemicals.
          </p>
        </div>
      </div>
    </div>
  )
}
