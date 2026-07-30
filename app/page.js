import Nav from '@/components/Nav'
import Link from 'next/link'

export default function Home() {
  const tools = [
    { href: '/app/calculator', icon: '⚗️', label: 'Dose Calculator', desc: 'Reconstitution and syringe dosing — free forever', badge: 'Free' },
    { href: '/app/encyclopedia', icon: '📖', label: 'Peptide Encyclopedia', desc: 'Mechanisms, studied dose ranges and research status', badge: 'Free' },
    { href: '/app/protocols', icon: '🧪', label: 'Protocols', desc: 'Save your regimens and log every dose', badge: 'Free' },
    { href: '/app/tracker', icon: '📊', label: 'Cycle Tracker', desc: 'Log daily doses and review your history', badge: 'Free' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />

      {/* Hero */}
      <div style={{
        maxWidth: '900px', margin: '0 auto',
        padding: '80px 28px 60px', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,214,143,0.08)',
          border: '1px solid rgba(0,214,143,0.22)',
          borderRadius: '50px', padding: '7px 18px 7px 10px',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'rgba(0,214,143,0.15)',
            border: '1px solid rgba(0,214,143,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--teal)',
              boxShadow: '0 0 8px var(--teal)',
            }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '12px',
            color: 'var(--teal)', letterSpacing: '0.05em',
          }}>Research intelligence platform · Built on published science</span>
        </div>

        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: 400, lineHeight: 0.98,
          letterSpacing: '-2px', color: 'var(--tx)',
          marginBottom: '24px',
        }}>
          The peptide platform<br />
          <span style={{ color: 'rgba(232,237,245,0.3)' }}>researchers </span>
          <em style={{ color: 'var(--teal)', fontStyle: 'italic' }}>rely on.</em>
        </h1>

        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '19px',
          fontWeight: 300, color: 'var(--tx2)',
          lineHeight: 1.75, maxWidth: '520px',
          margin: '0 auto 44px',
        }}>
          Precision tools and research-backed intelligence for serious peptide scientists. Free forever for the essentials.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/app/calculator" style={{
            fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600,
            color: '#021a0e', textDecoration: 'none',
            background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
            borderRadius: '13px', padding: '16px 36px',
            boxShadow: '0 8px 32px rgba(0,214,143,0.3)',
          }}>Open dose calculator →</Link>
          <Link href="/app/encyclopedia" style={{
            fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 400,
            color: 'var(--tx2)', textDecoration: 'none',
            background: 'var(--sl)', border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '13px', padding: '16px 36px',
          }}>Browse encyclopedia</Link>
        </div>
      </div>

      {/* Tools grid */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 28px 80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '14px',
      }}>
        {tools.map(tool => (
          <Link key={tool.href} href={tool.href} style={{
            textDecoration: 'none',
            background: 'var(--navy2)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '16px', padding: '24px',
            display: 'block', transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '28px' }}>{tool.icon}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
                padding: '3px 10px', borderRadius: '20px',
                background: tool.badge === 'Free' ? 'rgba(0,214,143,0.10)' : 'rgba(226,185,106,0.10)',
                color: tool.badge === 'Free' ? 'var(--teal)' : 'var(--gold)',
                border: tool.badge === 'Free' ? '1px solid rgba(0,214,143,0.22)' : '1px solid rgba(226,185,106,0.25)',
              }}>{tool.badge}</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: '16px',
              fontWeight: 600, color: 'var(--tx)', marginBottom: '6px',
            }}>{tool.label}</div>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: '13.5px',
              fontWeight: 300, color: 'var(--tx2)', lineHeight: 1.65,
            }}>{tool.desc}</div>
          </Link>
        ))}
      </div>

      {/* Footer disclaimer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.09)',
        padding: '20px 28px', textAlign: 'center',
        fontFamily: 'var(--font-mono)', fontSize: '11.5px',
        color: 'var(--tx3)', lineHeight: 1.8,
      }}>
        For research and educational purposes only. Not medical advice. Consult a licensed healthcare provider before using any peptide or research compound.
        <br />
        <Link href="/privacy-policy" style={{ color: 'var(--tx2)', textDecoration: 'none' }}>Privacy Policy</Link>
      </div>
    </div>
  )
}
