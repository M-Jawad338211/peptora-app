'use client'
import { useState, useRef, useEffect } from 'react'
import Nav from '@/components/Nav'
import ProGate from '@/components/ProGate'
import { ai } from '@/lib/api'

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your Peptora research assistant. I can answer questions about peptide mechanisms, research protocols, half-lives, storage, and more — all based on published scientific literature. What would you like to know?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const data = await ai.chat(userMsg, history)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: '16px',
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%', padding: '14px 18px', borderRadius: '14px',
              background: m.role === 'user' ? 'rgba(0,214,143,0.12)' : 'var(--navy2)',
              border: m.role === 'user' ? '1px solid rgba(0,214,143,0.2)' : '1px solid rgba(255,255,255,0.09)',
              fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx)', lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', marginBottom: '16px' }}>
            <div style={{
              padding: '14px 18px', borderRadius: '14px', background: 'var(--navy2)',
              border: '1px solid rgba(255,255,255,0.09)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--tx3)',
            }}>Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.09)' }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about peptide mechanisms, dosing research, storage…"
          style={{
            flex: 1, background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '11px', padding: '13px 16px', color: 'var(--tx)',
            fontFamily: 'var(--font-sans)', fontSize: '14px',
          }}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{
          padding: '13px 22px', borderRadius: '11px',
          background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
          color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '14px',
          fontWeight: 600, border: 'none', cursor: 'pointer',
          opacity: !input.trim() || loading ? 0.5 : 1,
        }}>Send</button>
      </div>
    </div>
  )
}

export default function AIAssistantPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 0' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: 'var(--tx)', fontWeight: 400, marginBottom: '4px' }}>AI Research Assistant</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', marginBottom: '28px' }}>Research-based answers about peptides. For educational use only.</p>
      </div>
      <ProGate feature="AI Research Assistant">
        <AIAssistant />
      </ProGate>
    </div>
  )
}
