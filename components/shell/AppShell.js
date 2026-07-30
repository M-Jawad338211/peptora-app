import Sidebar from './Sidebar'
import TabBar from './TabBar'
import AppHeader from './AppHeader'

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
        <AppHeader />
        {/* The mobile padding clears the fixed tab bar plus the iOS home
            indicator; md drops back to normal spacing since the tab bar is
            hidden there. */}
        <main className="mx-auto w-full max-w-[1100px] px-4 pt-5 pb-[calc(var(--spacing-tabbar)_+_env(safe-area-inset-bottom)_+_24px)] md:px-6 md:pb-12">
          {children}
        </main>
      </div>

      <TabBar />
    </div>
  )
}
