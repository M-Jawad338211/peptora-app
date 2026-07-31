import { WifiOff } from 'lucide-react'

export const metadata = { title: 'Offline · Peptora' }

/**
 * Precached by the service worker and served when a navigation fails with no
 * cached copy of the requested page.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-navy px-6 text-center">
      <WifiOff size={44} strokeWidth={1.4} aria-hidden="true" className="mb-4 text-tx3" />
      <h1 className="mb-2 text-xl font-bold text-tx">You&apos;re offline</h1>
      <p className="max-w-[40ch] text-sm leading-6 text-tx3-body">
        This page isn&apos;t available offline. The encyclopedia you&apos;ve
        already viewed still works — anything that needs your account will
        return once you reconnect.
      </p>
    </main>
  )
}
