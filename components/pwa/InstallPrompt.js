'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Download, Share, X } from 'lucide-react'

const DISMISS_KEY = 'peptora_install_dismissed_at'
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000

const noopSubscribe = () => () => {}

function dismissedRecently() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY))
    return Number.isFinite(at) && Date.now() - at < COOLDOWN_MS
  } catch {
    return false
  }
}

/**
 * Browser capabilities, read via useSyncExternalStore rather than an effect.
 * The server snapshot is always false, so the banner is absent from the SSR
 * markup and appears after hydration — no mismatch, and no setState driven
 * from inside an effect.
 */
function useIosInstallEligible() {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      const standalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
      return isIos && !standalone && !dismissedRecently()
    },
    () => false
  )
}

/**
 * Install affordance.
 *
 * Chrome/Edge fire `beforeinstallprompt`, which can be deferred and replayed.
 * iOS Safari never fires it and offers no programmatic install, so it gets
 * Share -> Add to Home Screen instructions instead.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const iosEligible = useIosInstallEligible()

  useEffect(() => {
    const onPrompt = (e) => {
      // Chrome would otherwise show its own mini-infobar; defer so the prompt
      // can be replayed from our own button.
      e.preventDefault()
      const standalone = window.matchMedia?.('(display-mode: standalone)').matches
      if (standalone || dismissedRecently()) return
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // Private mode — the banner simply returns next visit.
    }
    setDeferred(null)
    setDismissed(true)
  }

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    dismiss()
  }

  const showIosHint = iosEligible && !dismissed
  if (dismissed || (!deferred && !showIosHint)) return null

  return (
    <aside className="card mb-4 flex items-start gap-3 border-teal/25 bg-teal/6 p-3.5">
      <Download size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-tx">Install Peptora</p>
        {deferred ? (
          <p className="mt-0.5 text-[13px] leading-5 text-tx3-body">
            Add it to your home screen for a full-screen, app-like experience.
          </p>
        ) : (
          <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[13px] leading-5 text-tx3-body">
            Tap
            <Share size={13} aria-hidden="true" className="inline text-tx2" />
            <span className="text-tx2">Share</span>
            then <span className="text-tx2">Add to Home Screen</span>.
          </p>
        )}
        {deferred && (
          <button
            type="button"
            onClick={install}
            className="tap mt-2 rounded-[8px] bg-teal px-3 text-[13px] font-bold text-on-teal"
          >
            Install
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="tap flex shrink-0 items-center justify-center text-tx3-body hover:text-tx"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  )
}
