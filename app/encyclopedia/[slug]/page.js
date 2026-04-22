import Nav from '@/components/Nav'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const PEPTIDE_DATA = {
  'bpc-157': {
    name: 'BPC-157', category: 'Healing & Repair', status: 'Research Only',
    halfLife: '~4 hours', typicalDose: '250–500 mcg', storage: 'Lyophilised: refrigerate at 2–8°C. Reconstituted: stable 30 days at 4°C.',
    mechanism: 'BPC-157 (Body Protection Compound-157) is a synthetic pentadecapeptide derived from a protective protein found in human gastric juice. It has been shown in preclinical studies to accelerate wound healing through angiogenesis promotion, growth factor upregulation (including VEGF, EGF), and tendon-to-bone healing enhancement. It also appears to modulate dopaminergic and serotonergic neurotransmission.',
    researchDosing: 'Animal studies use 1–10 mcg/kg body weight. Human-equivalent doses frequently cited in online research communities range from 250–500 mcg administered subcutaneously or intramuscularly, once or twice daily.',
    notes: 'No human clinical trials completed as of 2024. All evidence is preclinical (rat models). Not FDA approved. Status as a research chemical varies by jurisdiction.',
  },
  'semaglutide': {
    name: 'Semaglutide', category: 'GLP-1 Agonist', status: 'FDA Approved',
    halfLife: '~7 days', typicalDose: '0.25–2.4 mg weekly', storage: 'Manufacturer pens: 2–8°C unopened; 15–30°C for up to 56 days after first use. Research vials: 2–8°C.',
    mechanism: 'Semaglutide is a GLP-1 receptor agonist that stimulates insulin secretion, suppresses glucagon, slows gastric emptying, and reduces appetite through central nervous system mechanisms. It has 94% amino acid sequence homology to native GLP-1 with a C18 fatty diacid chain extending half-life to ~7 days.',
    researchDosing: 'FDA-approved: 0.25 mg/week for 4 weeks → 0.5 mg → escalate up to 2.4 mg/week (Wegovy). Ozempic max 2 mg/week for T2D. Research use mirrors these protocols.',
    notes: 'FDA approved for Type 2 Diabetes (Ozempic) and chronic weight management (Wegovy). Approved in compounded form during shortage period — check current FDA guidance on compounding status.',
  },
  'tirzepatide': {
    name: 'Tirzepatide', category: 'GLP-1/GIP Dual Agonist', status: 'FDA Approved',
    halfLife: '~5 days', typicalDose: '2.5–15 mg weekly', storage: 'Manufacturer pens: 2–8°C. Research vials: 2–8°C. Do not freeze.',
    mechanism: 'Tirzepatide is a single peptide co-agonist of GLP-1 and GIP receptors. The dual mechanism provides additive effects on insulin secretion, appetite suppression, and fat utilisation. In clinical trials, it demonstrated superior weight loss to semaglutide.',
    researchDosing: 'FDA-approved start: 2.5 mg/week, escalate every 4 weeks to maintenance dose of 5–15 mg/week.',
    notes: 'FDA approved as Mounjaro (T2D) and Zepbound (obesity). SURMOUNT trials showed 20%+ body weight reduction at maximum doses.',
  },
}

// Fallback for slugs not in detailed data
function getBasicData(slug) {
  const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return {
    name, category: 'Research Peptide', status: 'Research Only',
    halfLife: 'See research literature', typicalDose: 'See research literature',
    storage: 'Lyophilised powder: 2–8°C. Reconstituted: use within 30 days at 4°C.',
    mechanism: `${name} is a research peptide. Detailed mechanism data is being added to the Peptora encyclopedia. Please consult peer-reviewed research databases for current literature.`,
    researchDosing: 'Dosing information is protocol-specific. Consult published research for preclinical data.',
    notes: 'For research and educational purposes only. Not medical advice. Not approved for human therapeutic use.',
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = PEPTIDE_DATA[slug] || getBasicData(slug)
  return {
    title: `${data.name} — Peptora Encyclopedia`,
    description: `Research summary for ${data.name}: mechanism, dosing data, half-life, storage, and regulatory status.`,
  }
}

export default async function PeptidePage({ params }) {
  const { slug } = await params
  const data = PEPTIDE_DATA[slug] || getBasicData(slug)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 28px 80px' }}>
        <Link href="/encyclopedia" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--tx3)', textDecoration: 'none', display: 'inline-block', marginBottom: '28px' }}>
          ← Encyclopedia
        </Link>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '4px 12px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--tx3)',
          }}>{data.category}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '4px 12px', borderRadius: '20px',
            background: data.status === 'FDA Approved' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
            border: data.status === 'FDA Approved' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.08)',
            color: data.status === 'FDA Approved' ? '#22c55e' : 'var(--tx3)',
          }}>{data.status}</span>
        </div>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 400, color: 'var(--tx)', marginBottom: '32px', letterSpacing: '-1px' }}>
          {data.name}
        </h1>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '36px' }}>
          {[
            { label: 'Half-life', value: data.halfLife },
            { label: 'Research dose', value: data.typicalDose },
            { label: 'Storage', value: 'See below' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '4px' }}>{label.toUpperCase()}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx)', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {[
          { title: 'Mechanism', content: data.mechanism },
          { title: 'Research Dosing', content: data.researchDosing },
          { title: 'Storage', content: data.storage },
          { title: 'Notes & Status', content: data.notes },
        ].map(({ title, content }) => (
          <div key={title} style={{ marginBottom: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--tx)', marginBottom: '10px' }}>{title}</h2>
            <div style={{
              background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '12px', padding: '20px',
            }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14.5px', color: 'var(--tx2)', lineHeight: 1.75, margin: 0 }}>{content}</p>
            </div>
          </div>
        ))}

        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '12px', padding: '16px 20px', marginTop: '32px',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fca5a5', lineHeight: 1.7, margin: 0 }}>
            ⚠ For research and educational purposes only. This is not medical advice and does not constitute a recommendation for human use.
            Consult a licensed healthcare provider. Regulatory status varies by jurisdiction.
          </p>
        </div>
      </div>
    </div>
  )
}
