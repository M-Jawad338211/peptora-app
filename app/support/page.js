'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'

const SUBJECTS = [
  'General inquiry',
  'Technical issue',
  'Billing & subscription',
  'Feature request',
  'Report a bug',
  'Other',
]

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 14px',
    background: 'var(--sl)',
    border: `1px solid ${hasError ? 'var(--red)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius: '10px',
    color: 'var(--tx)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 300,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  })

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--tx3)',
    marginBottom: '8px',
    letterSpacing: '0.04em',
  }

  const errorStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: 'var(--red)',
    marginTop: '5px',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '64px 28px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.18)',
            borderRadius: '20px', padding: '5px 14px', marginBottom: '20px',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--teal)' }}>SUPPORT</span>
          </div>
          <h1 style={{
            fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 44px)',
            color: 'var(--tx)', fontWeight: 400, marginBottom: '12px', letterSpacing: '-1px',
          }}>
            How can we help?
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--tx2)', fontWeight: 300 }}>
            Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        {submitted ? (
          /* Success state */
          <div style={{
            background: 'var(--navy2)', border: '1px solid rgba(0,214,143,0.2)',
            borderRadius: '20px', padding: '48px 32px', textAlign: 'center',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '24px',
            }}>✓</div>
            <h2 style={{
              fontFamily: 'Georgia, serif', fontSize: '26px',
              color: 'var(--tx)', fontWeight: 400, marginBottom: '10px',
            }}>
              Message sent
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--tx2)', fontWeight: 300, lineHeight: 1.6 }}>
              Thanks for reaching out, <strong style={{ color: 'var(--tx)', fontWeight: 500 }}>{form.name}</strong>.<br />
              We'll reply to <strong style={{ color: 'var(--teal)', fontWeight: 400 }}>{form.email}</strong> within 24 hours.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }) }}
              style={{
                marginTop: '28px', padding: '11px 24px', borderRadius: '10px',
                background: 'var(--sl)', border: '1px solid rgba(255,255,255,0.09)',
                color: 'var(--tx2)', fontFamily: 'var(--font-sans)', fontSize: '14px',
                cursor: 'pointer', fontWeight: 400,
              }}>
              Send another message
            </button>
          </div>
        ) : (
          /* Form */
          <div style={{
            background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '20px', padding: '36px 32px',
          }}>
            <form onSubmit={handleSubmit} noValidate>
              {/* Name + Email row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>NAME</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle(errors.name)}
                  />
                  {errors.name && <div style={errorStyle}>{errors.name}</div>}
                </div>
                <div>
                  <label style={labelStyle}>EMAIL</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle(errors.email)}
                  />
                  {errors.email && <div style={errorStyle}>{errors.email}</div>}
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>SUBJECT</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  style={{ ...inputStyle(false), appearance: 'none', cursor: 'pointer' }}
                >
                  {SUBJECTS.map(s => <option key={s} value={s} style={{ background: 'var(--navy2)' }}>{s}</option>)}
                </select>
              </div>

              {/* Message */}
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>MESSAGE</label>
                <textarea
                  placeholder="Describe your issue or question..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={5}
                  style={{ ...inputStyle(errors.message), resize: 'vertical', minHeight: '120px' }}
                />
                {errors.message && <div style={errorStyle}>{errors.message}</div>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'var(--sl)' : 'linear-gradient(135deg, #00d68f, #00f0a0)',
                  color: loading ? 'var(--tx3)' : '#021a0e',
                  border: 'none', borderRadius: '11px',
                  fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600,
                  cursor: loading ? 'default' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(0,214,143,0.22)',
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>
        )}

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--tx3)',
          textAlign: 'center', marginTop: '28px',
        }}>
          For urgent issues, email us directly at{' '}
          <a href="mailto:support@peptora.app" style={{ color: 'var(--teal)', textDecoration: 'none' }}>
            support@peptora.app
          </a>
        </p>
      </div>
    </div>
  )
}
