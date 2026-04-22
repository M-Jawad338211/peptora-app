import Nav from '@/components/Nav'
import Calculator from '@/components/Calculator'

export const metadata = {
  title: 'Dose Calculator — Peptora',
  description: 'Peptide reconstitution and syringe dosing calculator. Free forever.',
}

export default function CalculatorPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />

      <div style={{
        background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)',
        padding: '10px 28px', textAlign: 'center',
        fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#fca5a5',
      }}>
        ⚠ For research and educational purposes only. This tool does not constitute medical advice.
        Consult a licensed healthcare provider before using any research compound.
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 28px 0' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 46px)',
          fontWeight: 400, color: 'var(--tx)', marginBottom: '8px', letterSpacing: '-1px',
        }}>
          Dose Calculator
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--tx2)',
          marginBottom: '40px', fontWeight: 300,
        }}>
          Reconstitution volumes and syringe units for 26 research peptides.
        </p>
      </div>

      <Calculator />
    </div>
  )
}
