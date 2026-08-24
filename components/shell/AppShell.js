import { Suspense } from 'react'
import Sidebar from './Sidebar'
import TabBar from './TabBar'
import AppHeader from './AppHeader'
import ServiceWorker from '@/components/pwa/ServiceWorker'
import OfflineBanner from '@/components/pwa/OfflineBanner'
import TrialBanner from './TrialBanner'
import CheckoutReturn from '@/components/pricing/CheckoutReturn'

/**
 * The /app chrome: sidebar on desktop, bottom tabs on mobile.
 *
 * The breakpoint is pure CSS (`md:hidden` / `hidden md:flex`) rather than a JS
 * media query, so both variants are in the markup and the server render
 * matches the client — no hydration flash and no layout jump.
 */
export default function AppShell({ children }) {
  return (
    <div className="min-h-dvh bg-navy">
      <Sidebar />

      <div className="md:ml-sidebar">
        <OfflineBanner />
        <AppHeader />
        {/* The mobile padding clears the fixed tab bar plus the iOS home
            indicator; md drops back to normal spacing since the tab bar is
            hidden there. */}
        <main className="mx-auto w-full max-w-[1100px] px-4 pt-5 pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom)+24px)] md:px-6 md:pb-12">
          {/* Both are client components that render nothing unless they have
              something to say, so they cost an empty node on every screen and
              buy the same behaviour everywhere — the checkout return in
              particular must survive the user navigating away from /profile
              while the payment is still confirming. */}
          <Suspense fallback={null}>
            <CheckoutReturn />
          </Suspense>
          <TrialBanner />
          {children}
        </main>
      </div>

      <TabBar />
      <ServiceWorker />
    </div>
  )
}
