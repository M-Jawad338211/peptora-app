import Nav from '@/components/Nav'

const REGULATIONS = [
  { peptide: 'Semaglutide', fda: 'Approved (Rx)', compounding: 'Limited*', wada: false, uk: 'Approved (Rx)', updated: '2026-03' },
  { peptide: 'Tirzepatide', fda: 'Approved (Rx)', compounding: 'Limited*', wada: false, uk: 'Approved (Rx)', updated: '2026-03' },
  { peptide: 'Tesamorelin', fda: 'Approved (Rx)', compounding: 'Yes', wada: true, uk: 'Not approved', updated: '2026-01' },
  { peptide: 'PT-141', fda: 'Approved (Rx)', compounding: 'Yes', wada: false, uk: 'Not approved', updated: '2025-12' },
  { peptide: 'BPC-157', fda: 'Not approved', compounding: 'Banned (503A/B)', wada: false, uk: 'Not approved', updated: '2026-01' },
  { peptide: 'TB-500', fda: 'Not approved', compounding: 'Banned (503A/B)', wada: true, uk: 'Not approved', updated: '2025-12' },
  { peptide: 'Ipamorelin', fda: 'Not approved', compounding: 'Banned', wada: true, uk: 'Not approved', updated: '2025-10' },
  { peptide: 'CJC-1295', fda: 'Not approved', compounding: 'Banned', wada: true, uk: 'Not approved', updated: '2025-10' },
  { peptide: 'Sermorelin', fda: 'Withdrawn', compounding: 'Banned', wada: true, uk: 'Not approved', updated: '2025-10' },
  { peptide: 'GHRP-2', fda: 'Not approved', compounding: 'Banned', wada: true, uk: 'Not approved', updated: '2025-10' },
  { peptide: 'GHRP-6', fda: 'Not approved', compounding: 'Banned', wada: true, uk: 'Not approved', updated: '2025-10' },
  { peptide: 'Thymosin Alpha-1', fda: 'Not approved', compounding: 'Yes', wada: false, uk: 'Not approved', updated: '2025-11' },
  { peptide: 'Epitalon', fda: 'Not approved', compounding: 'Unknown', wada: false, uk: 'Not approved', updated: '2025-09' },
  { peptide: 'Semax', fda: 'Not approved', compounding: 'Unknown', wada: false, uk: 'Not approved', updated: '2025-09' },
  { peptide: 'Retatrutide', fda: 'Phase 3', compounding: 'N/A', wada: false, uk: 'Phase 3', updated: '2026-02' },
]

export const metadata = {
  title: 'Regulatory Tracker — Peptora',
  description: 'FDA, MHRA and WADA peptide regulatory status — updated regularly.',
}

export default function RegulationsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 28px 80px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 400, color: 'var(--tx)', marginBottom: '8px', letterSpacing: '-1px' }}>
          Regulatory Tracker
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--tx2)', marginBottom: '36px', fontWeight: 300 }}>
          FDA, MHRA, and WADA status for research peptides. Updated monthly.
        </p>

        <div style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr 80px 1fr 90px',
            padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.09)',
          }}>
            {['PEPTIDE', 'FDA STATUS', 'COMPOUNDING (US)', 'WADA', 'UK/MHRA', 'UPDATED'].map(h => (
              <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)' }}>{h}</div>
            ))}
          </div>

          {REGULATIONS.map((r, i) => (
            <div key={r.peptide} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr 80px 1fr 90px',
              padding: '13px 20px', alignItems: 'center',
              borderBottom: i < REGULATIONS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--tx)', fontWeight: 500 }}>{r.peptide}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: r.fda.startsWith('Approved') ? '#22c55e' : r.fda === 'Phase 3' ? '#e2b96a' : 'var(--tx3)',
              }}>{r.fda}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: r.compounding === 'Yes' ? '#22c55e' : r.compounding.startsWith('Banned') ? '#ef4444' : 'var(--tx3)',
              }}>{r.compounding}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: r.wada ? '#ef4444' : '#22c55e',
              }}>{r.wada ? 'Banned' : 'Allowed'}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: r.uk.startsWith('Approved') ? '#22c55e' : 'var(--tx3)',
              }}>{r.uk}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)' }}>{r.updated}</span>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', marginBottom: '8px' }}>
          * Compounding status subject to FDA shortage and 503A/503B designation changes
        </p>

        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
          borderRadius: '12px', padding: '16px 20px', marginTop: '16px',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fca5a5', lineHeight: 1.8, margin: 0 }}>
            ⚠ This tracker is for informational purposes only and does not constitute legal advice. Regulatory status changes frequently.
            Always verify current status with FDA.gov, MHRA.gov.uk, and wada-ama.org directly.
            Peptora is not liable for any decisions made based on this information.
          </p>
        </div>
      </div>
    </div>
  )
}
