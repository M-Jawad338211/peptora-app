'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import ProGate from '@/components/ProGate'
import { ai } from '@/lib/api'

const PEPTIDE_NAMES = [
  'BPC-157', 'TB-500', 'GHK-Cu', 'Ipamorelin', 'CJC-1295 (no DAC)', 'CJC-1295 (with DAC)',
  'GHRP-2', 'GHRP-6', 'Sermorelin', 'Tesamorelin', 'Semaglutide', 'Tirzepatide', 'Retatrutide',
  'AOD-9604', 'Semax', 'Selank', 'Dihexa', 'Epitalon', 'Thymalin', 'Thymosin Alpha-1',
  'MOTS-C', 'SS-31', 'KPV', 'MK-677', 'PT-141',
]

function StackChecker() {
  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggle = (name) => {
    setSelected(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name].slice(0, 5))
  }

  const check = async () => {
    if (selected.length < 2) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await ai.stackCheck(selected)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 80px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', marginBottom: '24px' }}>
        Select 2–5 peptides to analyse compatibility
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {PEPTIDE_NAMES.map(name => (
          <button key={name} onClick={() => toggle(name)} style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s',
            background: selected.includes(name) ? 'rgba(0,214,143,0.12)' : 'var(--sl)',
            border: selected.includes(name) ? '1px solid rgba(0,214,143,0.3)' : '1px solid rgba(255,255,255,0.1)',
            color: selected.includes(name) ? 'var(--teal)' : 'var(--tx2)',
          }}>{name}</button>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)', marginBottom: '10px' }}>
          SELECTED ({selected.length}/5):
        </div>
        {selected.length === 0 ? (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--tx3)' }}>None selected</span>
        ) : (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selected.map(name => (
              <span key={name} style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '5px 12px', borderRadius: '20px',
                background: 'rgba(0,214,143,0.12)', border: '1px solid rgba(0,214,143,0.25)', color: 'var(--teal)',
              }}>{name}</span>
            ))}
          </div>
        )}
      </div>

      <button onClick={check} disabled={selected.length < 2 || loading} style={{
        padding: '14px 32px', borderRadius: '11px',
        background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
        color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '15px',
        fontWeight: 600, border: 'none', cursor: selected.length < 2 ? 'not-allowed' : 'pointer',
        opacity: selected.length < 2 ? 0.5 : 1, marginBottom: '32px',
      }}>
        {loading ? 'Analysing stack…' : 'Analyse compatibility →'}
      </button>

      {error && <p style={{ color: 'var(--red)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>{error}</p>}

      {result && (
        <div style={{
          background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '16px', padding: '28px',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '16px' }}>
            STACK ANALYSIS: {selected.join(' + ')}
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: '14.5px', color: 'var(--tx2)',
            lineHeight: 1.8, whiteSpace: 'pre-wrap',
          }}>
            {result.analysis}
          </div>
          <div style={{
            marginTop: '20px', padding: '14px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fca5a5',
          }}>
            ⚠ For research purposes only. Not medical advice.
          </div>
        </div>
      )}
    </div>
  )
}

export default function StackCheckerPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 0' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: 'var(--tx)', fontWeight: 400, marginBottom: '4px' }}>Stack Checker</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', marginBottom: '28px' }}>
          AI compatibility analysis for peptide combinations, based on published research.
        </p>
      </div>
      <ProGate feature="Stack Checker">
        <StackChecker />
      </ProGate>
    </div>
  )
}
