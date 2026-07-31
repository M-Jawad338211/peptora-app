'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * Registers the service worker and surfaces updates.
 *
 * Mounted only inside /app, and registered with an explicit /app/ scope, so
 * the marketing pages stay uncontrolled.
 *
 * Updates never reload on their own — the user may be mid-form, and this app
 * holds dose data.
 */
export default function ServiceWorker() {
  const [waiting, setWaiting] = useState(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    // A dev-mode worker caches build output that changes on every edit.
    if (process.env.NODE_ENV !== 'production') return

    let registration

    const onUpdateFound = () => {
      const installing = registration.installing
      if (!installing) return
      installing.addEventListener('statechange', () => {
        // `controller` being set means this is an update, not a first install.
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          setWaiting(installing)
        }
      })
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/app/' })
      .then((reg) => {
        registration = reg
        reg.addEventListener('updatefound', onUpdateFound)
      })
      .catch(() => {
        // A failed registration must not break the app; it just means no
        // offline support this session.
      })

    let reloading = false
    const onControllerChange = () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    return () => {
      registration?.removeEventListener('updatefound', onUpdateFound)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  if (!waiting) return null

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom)+12px)] z-50 flex items-center gap-3 rounded-[12px] border border-teal/30 bg-surface p-3 shadow-lg md:right-4 md:bottom-4 md:left-auto md:w-80"
    >
      <RefreshCw size={16} aria-hidden="true" className="shrink-0 text-teal" />
      <p className="flex-1 text-[13px] text-tx">A new version is available.</p>
      <button
        type="button"
        onClick={() => waiting.postMessage({ type: 'SKIP_WAITING' })}
        className="tap shrink-0 rounded-[8px] bg-teal px-3 text-[13px] font-bold text-on-teal"
      >
        Reload
      </button>
    </div>
  )
}
