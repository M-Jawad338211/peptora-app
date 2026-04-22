'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'

export default function DownloadPage() {
  const [platform, setPlatform] = useState('desktop')

  useEffect(() => {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) setPlatform('android')
    else if (/iphone|ipad|ipod/i.test(ua)) setPlatform('ios')
    else setPlatform('desktop')
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 28px 80px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          {platform === 'android' ? '🤖' : platform === 'ios' ? '🍎' : '🖥️'}
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: 'var(--tx)', fontWeight: 400, marginBottom: '12px' }}>
          Get Peptora on {platform === 'android' ? 'Android' : platform === 'ios' ? 'iPhone' : 'your device'}
        </h1>

        {platform === 'android' && (
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--tx2)', marginBottom: '28px', lineHeight: 1.7 }}>
              Download the Peptora APK directly. No Play Store required.
            </p>
            <a href="/downloads/peptora.apk" download style={{
              display: 'inline-block', padding: '16px 40px', borderRadius: '13px',
              background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
              color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '16px',
              fontWeight: 600, textDecoration: 'none', marginBottom: '36px',
              boxShadow: '0 8px 24px rgba(0,214,143,0.25)',
            }}>
              Download Peptora APK
            </a>
            <div style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', padding: '24px', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '14px' }}>INSTALL INSTRUCTIONS</div>
              {[
                'Download the APK file above',
                'Open your Downloads folder or notification shade',
                'Tap the peptora.apk file',
                'If prompted "Unknown sources" — tap Settings → Allow from this source',
                'Tap Install and wait for completion',
                'Open Peptora from your app drawer',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < 5 ? '10px' : 0 }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(0,214,143,0.12)', border: '1px solid rgba(0,214,143,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--teal)',
                  }}>{i + 1}</div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', margin: 0, lineHeight: 1.6 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {platform === 'ios' && (
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--tx2)', marginBottom: '28px', lineHeight: 1.7 }}>
              Add Peptora to your home screen for a native app experience.
            </p>
            <div style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', padding: '24px', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '14px' }}>ADD TO HOME SCREEN</div>
              {[
                'Open peptora.app in Safari (not Chrome)',
                'Tap the Share button at the bottom of the screen',
                'Scroll down and tap "Add to Home Screen"',
                'Name it "Peptora" and tap Add',
                'Find the Peptora icon on your home screen',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < 4 ? '10px' : 0 }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(0,214,143,0.12)', border: '1px solid rgba(0,214,143,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--teal)',
                  }}>{i + 1}</div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--tx2)', margin: 0, lineHeight: 1.6 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {platform === 'desktop' && (
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--tx2)', marginBottom: '28px', lineHeight: 1.7 }}>
              Peptora works right here in your browser. No download required.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/calculator" style={{
                padding: '14px 32px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #00d68f, #00f0a0)',
                color: '#021a0e', fontFamily: 'var(--font-sans)', fontSize: '15px',
                fontWeight: 600, textDecoration: 'none',
              }}>Open calculator →</a>
            </div>
            <div style={{ marginTop: '36px', background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', padding: '24px', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tx3)', marginBottom: '10px' }}>ANDROID APK</div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--tx2)', marginBottom: '14px' }}>
                If you want the Android app, visit this page on your Android device or download directly:
              </p>
              <a href="/downloads/peptora.apk" download style={{
                fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--teal)', textDecoration: 'none',
              }}>↓ peptora.apk</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
