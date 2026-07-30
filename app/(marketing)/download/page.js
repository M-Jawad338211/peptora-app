'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'

const noopSubscribe = () => () => {}

/**
 * Platform detection via useSyncExternalStore so the server snapshot is
 * stable ('desktop') and the client corrects after hydration — no mismatch.
 */
function usePlatform() {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      const ua = navigator.userAgent
      if (/android/i.test(ua)) return 'android'
      if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
      return 'desktop'
    },
    () => 'desktop'
  )
}

const STEPS = {
  android: [
    'Open peptora.io in Chrome.',
    'Tap the ⋮ menu in the top-right.',
    'Choose “Install app” or “Add to Home screen”.',
    'Confirm — Peptora appears alongside your other apps.',
  ],
  ios: [
    'Open peptora.io in Safari (not Chrome — only Safari can install).',
    'Tap the Share button at the bottom of the screen.',
    'Scroll down and choose “Add to Home Screen”.',
    'Tap Add — Peptora appears on your home screen.',
  ],
  desktop: [
    'Open peptora.io in Chrome, Edge or Arc.',
    'Click the install icon in the address bar.',
    'Confirm — Peptora opens in its own window.',
  ],
}

const LABEL = { android: 'Android', ios: 'iPhone or iPad', desktop: 'your computer' }

export default function DownloadPage() {
  const platform = usePlatform()
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const check = () =>
      setInstalled(
        window.matchMedia?.('(display-mode: standalone)').matches ||
          window.navigator.standalone === true
      )
    check()
    const mq = window.matchMedia?.('(display-mode: standalone)')
    mq?.addEventListener?.('change', check)
    return () => mq?.removeEventListener?.('change', check)
  }, [])

  return (
    <>
      <div className="mx-auto max-w-[680px] px-7 pt-16 pb-20">
        <div className="text-center">
          <div className="mb-5 text-5xl" aria-hidden="true">
            {platform === 'android' ? '🤖' : platform === 'ios' ? '🍎' : '🖥️'}
          </div>
          <h1 className="mb-3 font-display text-4xl text-tx">
            Install Peptora on {LABEL[platform]}
          </h1>
          <p className="mb-8 text-[15px] leading-7 text-tx3-body">
            Peptora installs straight from the browser — no app store, no
            download. It runs full-screen with its own icon, and the peptide
            encyclopedia stays readable offline.
          </p>
        </div>

        {installed ? (
          <div className="rounded-card border border-teal/25 bg-teal/8 p-5 text-center">
            <p className="mb-3 text-base font-bold text-teal">
              Peptora is already installed.
            </p>
            <Link
              href="/app/home"
              className="inline-flex min-h-[44px] items-center rounded-[12px] bg-teal px-5 text-[15px] font-bold text-on-teal no-underline"
            >
              Open the app
            </Link>
          </div>
        ) : (
          <>
            <ol className="card space-y-4 p-6">
              {STEPS[platform].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal/15 font-mono text-[12px] font-bold text-teal"
                  >
                    {i + 1}
                  </span>
                  <span className="text-[15px] leading-6 text-tx2">{step}</span>
                </li>
              ))}
            </ol>

            <p className="mt-6 text-center text-[13px] leading-6 text-tx3-body">
              Prefer not to install?{' '}
              <Link href="/app/home" className="text-teal no-underline">
                Use Peptora in your browser
              </Link>{' '}
              — everything works the same.
            </p>
          </>
        )}

        <p className="mt-10 text-center text-[12px] leading-5 text-tx3-body">
          Native Android and iOS apps are on the way. Until they land, the
          installed web app is the full Peptora experience.
        </p>
      </div>
    </>
  )
}
