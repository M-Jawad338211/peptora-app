import { redirect } from 'next/navigation'
import AppShell from '@/components/shell/AppShell'
import { getSession } from '@/lib/auth/server-session'

export const metadata = {
  title: 'Peptora',
}

/**
 * Wraps the product screens in the tab-bar/sidebar chrome and enforces consent.
 *
 * getSession is React-cached, so this shares the parent layout's /auth/me call
 * rather than issuing another.
 *
 * This is a route group and adds no URL segment. Auth and consent sit outside
 * it — inside the PWA scope, but without navigation chrome.
 */
export default async function ShellLayout({ children }) {
  const user = await getSession()

  // Mirrors peptora-android/app/(tabs)/_layout.js:19-34. Anonymous users are
  // deliberately NOT gated: the encyclopedia and calculator stay open, as in
  // the native app.
  if (user && !user.consent_accepted) redirect('/app/consent')

  return <AppShell>{children}</AppShell>
}
