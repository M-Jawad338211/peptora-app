'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import ProGate from '@/components/ProGate'
import { ai } from '@/lib/api'

const GOALS = [
  'Tissue repair & injury recovery',
  'GH / IGF-1 optimisation',
  'Fat loss & body recomposition',
  'Cognitive enhancement & neuroprotection',
  'Anti-aging & longevity',
  'Immune modulation',
  'Metabolic health & insulin sensitivity',
  'Sleep & recovery optimisation',
  'Sexual health',
  'Hair & skin regeneration',
]

function ProtocolFinder() {
  const [selectedGoals, setSelectedGoals] = useState([])
  const [experience, setExperience] = useState('beginner')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const toggle = (g) => setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g].slice(0, 3))

  const find = async () => {
    if (selectedGoals.length === 0) return
    setLoading(true)
    setResult('')
    const prompt = `Suggest a research peptide protocol for these goals: ${selectedGoals.join(', ')}.
Experience level: ${experience}.
Provide: recommended peptides, research dosing ranges, timing, and important considerations.
Base everything on published research. Include storage and reconstitution notes.
End with a disclaimer that this is for research/educational purposes only.`
    try {
      const data = await ai.chat(prompt, [])
      setResult(data.reply)
    } catch (err) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '12px' }}>SELECT UP TO 3 RESEARCH GOALS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {GOALS.map(g => (
            <button key={g} onClick={() => toggle(g)} style={{
              fontFamily: 'var(--font-sans)', fontSize: '13px',
              padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
              background: selectedGoals.includes(g) ? 'rgba(0,214,143,0.12)' : 'var(--sl)',
              border: selectedGoals.includes(g) ? '1px solid rgba(0,214,143,0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: selectedGoals.includes(g) ? 'var(--teal)' : 'var(--tx2)',
              transition: 'all 0.15s',
            }}>{g}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '10px' }}>RESEARCH EXPERIENCE LEVEL</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['beginner', 'intermediate', 'advanced'].map(level => (
            <button key={level} onClick={() => setExperience(level)} style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              padding: '7px 18px', borderRadius: '20px', cursor: 'pointer',
              background: experience === level ? 'rgba(0,214,143,0.12)' : 'var(--sl)',
              border: experience === level ? '1px solid rgba(0,214,143,0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: experience === level ? 'var(--teal)' : 'var(--tx2)',
            }}>{level.charAt(0).toUpperCase() + level.slice(1)}</button>
          ))}
        </div>
      </div>

      <button onClick={find} disabled={selectedGoals.length === 0 || loading} style={{
        padding: '13px 32px', borderRadius: '11px',
        background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
        color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '15px',
        fontWeight: 600, border: 'none', cursor: selectedGoals.length === 0 ? 'not-allowed' : 'pointer',
        opacity: selectedGoals.length === 0 ? 0.5 : 1, marginBottom: '32px',
      }}>
        {loading ? 'Finding protocol…' : 'Find research protocol →'}
      </button>

      {result && (
        <div style={{
          background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '16px', padding: '28px',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--teal)', marginBottom: '16px' }}>
            RESEARCH PROTOCOL — {selectedGoals.join(' + ')}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14.5px', color: 'var(--tx2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProtocolFinderPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 0' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: 'var(--tx)', fontWeight: 400, marginBottom: '4px' }}>Protocol Finder</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', marginBottom: '28px' }}>
          Goal-based AI protocol recommendations. For research purposes only.
        </p>
      </div>
      <ProGate feature="Protocol Finder">
        <ProtocolFinder />
      </ProGate>
    </div>
  )
}
