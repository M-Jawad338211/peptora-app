'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import ProGate from '@/components/ProGate'
import { ai } from '@/lib/api'

function CycleTracker() {
  const [logs, setLogs] = useState([])
  const [peptide, setPeptide] = useState('')
  const [dose, setDose] = useState('')
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  const addLog = () => {
    if (!peptide || !dose) return
    setLogs(prev => [...prev, {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      peptide, dose, notes,
    }])
    setPeptide('')
    setDose('')
    setNotes('')
  }

  const getWeeklySummary = async () => {
    if (logs.length === 0) return
    setSummaryLoading(true)
    setSummary('')
    const logText = logs.map(l => `${l.date}: ${l.peptide} ${l.dose}mcg${l.notes ? ` — ${l.notes}` : ''}`).join('\n')
    try {
      const data = await ai.chat(
        `Summarise this week's peptide research log and note any observations about consistency or patterns. For research purposes only.\n\n${logText}`,
        []
      )
      setSummary(data.reply)
    } catch (err) {
      setSummary(`Error: ${err.message}`)
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 80px' }}>
      {/* Add entry */}
      <div style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '16px' }}>LOG TODAY&apos;S DOSE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>PEPTIDE</label>
            <input value={peptide} onChange={e => setPeptide(e.target.value)} placeholder="e.g. BPC-157"
              style={{
                width: '100%', background: 'var(--sl)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9px', padding: '11px', color: 'var(--tx)', fontFamily: 'var(--font-sans)',
                fontSize: '14px', boxSizing: 'border-box',
              }} />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', display: 'block', marginBottom: '6px' }}>DOSE (mcg)</label>
            <input type="number" value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 250"
              style={{
                width: '100%', background: 'var(--sl)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9px', padding: '11px', color: 'var(--tx)', fontFamily: 'var(--font-sans)',
                fontSize: '14px', boxSizing: 'border-box',
              }} />
          </div>
        </div>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
          style={{
            width: '100%', background: 'var(--sl)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '9px', padding: '11px', color: 'var(--tx)', fontFamily: 'var(--font-sans)',
            fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box',
          }} />
        <button onClick={addLog} disabled={!peptide || !dose} style={{
          padding: '11px 24px', borderRadius: '9px',
          background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
          color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '14px',
          fontWeight: 600, border: 'none', cursor: 'pointer',
          opacity: !peptide || !dose ? 0.5 : 1,
        }}>+ Add to log</button>
      </div>

      {/* Log entries */}
      {logs.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '12px' }}>
            THIS WEEK ({logs.length} entries)
          </div>
          {logs.map(l => (
            <div key={l.id} style={{
              background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '10px', padding: '14px 18px', marginBottom: '8px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx)', fontWeight: 500 }}>{l.peptide}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--teal)', marginLeft: '10px' }}>{l.dose} mcg</span>
                {l.notes && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--tx3)', margin: '4px 0 0' }}>{l.notes}</p>}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)' }}>{l.date}</span>
            </div>
          ))}

          <button onClick={getWeeklySummary} disabled={summaryLoading} style={{
            marginTop: '12px', padding: '11px 24px', borderRadius: '9px',
            background: 'var(--sl)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--tx2)', fontFamily: 'var(--font-sans)', fontSize: '14px',
            cursor: 'pointer',
          }}>
            {summaryLoading ? 'Generating AI summary…' : 'Get weekly AI summary →'}
          </button>
        </div>
      )}

      {summary && (
        <div style={{
          background: 'var(--navy2)', border: '1px solid rgba(0,214,143,0.2)',
          borderRadius: '14px', padding: '24px',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--teal)', marginBottom: '12px' }}>AI WEEKLY SUMMARY</div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{summary}</p>
        </div>
      )}

      {logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tx3)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
          Start logging your research protocol above to track patterns and get AI-powered weekly summaries.
        </div>
      )}
    </div>
  )
}

export default function CycleTrackerPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 0' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: 'var(--tx)', fontWeight: 400, marginBottom: '4px' }}>Cycle Tracker</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', marginBottom: '28px' }}>Log daily protocols and get weekly AI summaries. For research use only.</p>
      </div>
      <ProGate feature="Cycle Tracker">
        <CycleTracker />
      </ProGate>
    </div>
  )
}
