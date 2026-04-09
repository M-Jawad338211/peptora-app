'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  const links = [
    { href: '/calculator', label: 'Calculator' },
    { href: '/encyclopedia', label: 'Encyclopedia' },
    { href: '/stack-checker', label: 'Stack Checker' },
    { href: '/cycle-tracker', label: 'Cycle Tracker' },
    { href: '/protocol-finder', label: 'Protocol Finder' },
    { href: '/vendors', label: 'Vendors' },
    { href: '/regulations', label: 'Regulations' },
  ]

  return (
    <nav style={{
      height: '62px',
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(26,37,53,0.97)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.09)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center',
          gap: '10px', textDecoration: 'none',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'rgba(0,214,143,0.10)',
            border: '1px solid rgba(0,214,143,0.22)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px',
          }}>🧬</div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '17px', fontWeight: 600,
            color: 'var(--tx)', letterSpacing: '-0.2px',
          }}>
            Peptora<em style={{ color: 'var(--teal)', fontStyle: 'normal' }}>.io</em>
          </span>
        </Link>

        {/* Nav links - hidden on mobile */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '4px', flexWrap: 'wrap',
        }} className="nav-links">
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: pathname === link.href ? 'var(--teal)' : 'var(--tx2)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '7px',
              background: pathname === link.href ? 'rgba(0,214,143,0.10)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/login" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px', color: 'var(--tx2)',
            textDecoration: 'none',
            padding: '7px 16px',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '8px',
            transition: 'all 0.15s',
          }}>Log in</Link>
          <Link href="/signup" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px', fontWeight: 600,
            color: '#021a0e',
            background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
            textDecoration: 'none',
            padding: '8px 18px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(0,214,143,0.25)',
          }}>Get started</Link>
        </div>
      </div>
    </nav>
  )
}