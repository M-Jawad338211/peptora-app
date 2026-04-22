import Nav from '@/components/Nav'
import Link from 'next/link'

const PEPTIDES = [
  { slug: 'bpc-157', name: 'BPC-157', category: 'Healing', desc: 'Body protection compound derived from gastric juice. Studied for tissue repair and gut healing.', status: 'Research' },
  { slug: 'tb-500', name: 'TB-500', category: 'Healing', desc: 'Thymosin Beta-4 fragment. Studied for wound healing, angiogenesis, and inflammation reduction.', status: 'Research' },
  { slug: 'ghk-cu', name: 'GHK-Cu', category: 'Regenerative', desc: 'Copper peptide with studied roles in skin repair, anti-inflammatory activity, and collagen synthesis.', status: 'Research' },
  { slug: 'ipamorelin', name: 'Ipamorelin', category: 'GH Peptide', desc: 'Selective GH secretagogue. Stimulates pituitary GH release with minimal cortisol or prolactin effect.', status: 'Research' },
  { slug: 'cjc-1295-no-dac', name: 'CJC-1295 (no DAC)', category: 'GH Peptide', desc: 'Modified GHRH analogue with ~30 min half-life. Often combined with a GHRP.', status: 'Research' },
  { slug: 'cjc-1295-dac', name: 'CJC-1295 (with DAC)', category: 'GH Peptide', desc: 'Drug Affinity Complex extends half-life to ~8 days. Once or twice weekly dosing.', status: 'Research' },
  { slug: 'ghrp-2', name: 'GHRP-2', category: 'GH Peptide', desc: 'GH releasing hexapeptide. Strong GH pulse stimulator with some cortisol and prolactin elevation.', status: 'Research' },
  { slug: 'ghrp-6', name: 'GHRP-6', category: 'GH Peptide', desc: 'First-generation GHRP. Notable for appetite increase via ghrelin mimicry.', status: 'Research' },
  { slug: 'sermorelin', name: 'Sermorelin', category: 'GH Peptide', desc: 'GHRH(1-29) analogue. Previously FDA-approved for GH deficiency diagnosis.', status: 'Withdrawn' },
  { slug: 'tesamorelin', name: 'Tesamorelin', category: 'GH Peptide', desc: 'GHRH analogue FDA-approved for HIV-associated lipodystrophy. Also studied for cognitive benefits.', status: 'FDA Approved' },
  { slug: 'semaglutide', name: 'Semaglutide', category: 'GLP-1', desc: 'GLP-1 receptor agonist FDA-approved for T2D and obesity (Ozempic, Wegovy). Weekly dosing.', status: 'FDA Approved' },
  { slug: 'tirzepatide', name: 'Tirzepatide', category: 'GLP-1/GIP', desc: 'Dual GLP-1/GIP agonist (Mounjaro, Zepbound). FDA-approved for T2D and obesity.', status: 'FDA Approved' },
  { slug: 'retatrutide', name: 'Retatrutide', category: 'GLP-1/GIP/GCG', desc: 'Triple agonist in Phase 3 trials. Shows significant weight loss in clinical research.', status: 'Phase 3' },
  { slug: 'aod-9604', name: 'AOD-9604', category: 'Fat Loss', desc: 'C-terminal fragment of hGH. Studied for fat metabolism without IGF-1 or insulin effects.', status: 'Research' },
  { slug: 'semax', name: 'Semax', category: 'Nootropic', desc: 'ACTH(4-7) analogue developed in Russia. Studied for neuroprotection and cognitive enhancement.', status: 'Research' },
  { slug: 'selank', name: 'Selank', category: 'Nootropic', desc: 'Tuftsin analogue with anxiolytic and nootropic properties studied in Russian research.', status: 'Research' },
  { slug: 'dihexa', name: 'Dihexa', category: 'Nootropic', desc: 'HGF/SF modulator studied for cognitive enhancement in Alzheimer\'s models.', status: 'Research' },
  { slug: 'epitalon', name: 'Epitalon', category: 'Anti-aging', desc: 'Tetrapeptide based on epithalamin. Studied for telomere lengthening and anti-aging effects.', status: 'Research' },
  { slug: 'thymalin', name: 'Thymalin', category: 'Immune', desc: 'Thymus-derived peptide complex studied for immune modulation and longevity in Russian research.', status: 'Research' },
  { slug: 'thymosin-alpha-1', name: 'Thymosin Alpha-1', category: 'Immune', desc: 'Approved in 35+ countries for hepatitis B/C and as immunomodulator. Strong research base.', status: 'Approved (non-US)' },
  { slug: 'mots-c', name: 'MOTS-C', category: 'Mitochondrial', desc: 'Mitochondria-derived peptide studied for metabolic regulation, insulin sensitivity, and exercise mimicry.', status: 'Research' },
  { slug: 'ss-31', name: 'SS-31 (Elamipretide)', category: 'Mitochondrial', desc: 'Mitochondria-targeting peptide studied for heart failure and mitochondrial disease. In clinical trials.', status: 'Clinical Trials' },
  { slug: 'kpv', name: 'KPV', category: 'Anti-inflammatory', desc: 'Alpha-MSH tripeptide fragment with studied anti-inflammatory and antimicrobial properties.', status: 'Research' },
  { slug: 'mk-677', name: 'MK-677 (Ibutamoren)', category: 'GH Secretagogue', desc: 'Oral GH secretagogue. Non-peptide. Increases GH and IGF-1 with once-daily oral dosing.', status: 'Research' },
  { slug: 'pt-141', name: 'PT-141 (Bremelanotide)', category: 'Sexual Health', desc: 'Melanocortin receptor agonist. FDA-approved for hypoactive sexual desire disorder in women.', status: 'FDA Approved' },
  { slug: 'cerebrolysin', name: 'Cerebrolysin', category: 'Nootropic', desc: 'Porcine brain-derived peptide mixture studied for neurodegeneration, stroke recovery, and cognition.', status: 'Approved (non-US)' },
]

const CATEGORIES = ['All', ...new Set(PEPTIDES.map(p => p.category))]

const STATUS_COLORS = {
  'FDA Approved': '#22c55e',
  'Research': '#9db4cc',
  'Phase 3': '#e2b96a',
  'Clinical Trials': '#e2b96a',
  'Withdrawn': '#ef4444',
  'Approved (non-US)': '#60a5fa',
}

export const metadata = {
  title: 'Peptide Encyclopedia — Peptora',
  description: '100 peptides with mechanisms, dosing research, and regulatory status.',
}

export default function EncyclopediaPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 28px 80px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 400, color: 'var(--tx)', marginBottom: '8px', letterSpacing: '-1px' }}>
          Peptide Encyclopedia
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--tx2)', marginBottom: '40px', fontWeight: 300 }}>
          Research summaries for {PEPTIDES.length} peptides — mechanisms, dosing data, and regulatory status.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '14px',
        }}>
          {PEPTIDES.map(p => (
            <Link key={p.slug} href={`/encyclopedia/${p.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '14px', padding: '22px', height: '100%',
                transition: 'border-color 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '3px 9px',
                    borderRadius: '20px', background: 'rgba(255,255,255,0.06)',
                    color: 'var(--tx3)', border: '1px solid rgba(255,255,255,0.08)',
                  }}>{p.category}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px', color: STATUS_COLORS[p.status] || 'var(--tx3)',
                  }}>{p.status}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--tx)', marginBottom: '8px' }}>{p.name}</h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--tx2)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)',
          textAlign: 'center', marginTop: '48px', lineHeight: 1.8,
        }}>
          For research and educational purposes only. Not medical advice.
          All information sourced from peer-reviewed literature and publicly available research.
        </p>
      </div>
    </div>
  )
}
