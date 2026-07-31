'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

/**
 * Persistent notice while the browser reports no connection, so a failed save
 * reads as "you're offline" rather than "the app is broken".
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warn/15 px-4 py-2 text-[13px] text-warn"
    >
      <WifiOff size={14} aria-hidden="true" />
      You&apos;re offline — changes won&apos;t save until you reconnect.
    </div>
  )
}
