import { redirect } from 'next/navigation'
import AppShell from '@/components/shell/AppShell'
import { getSession } from '@/lib/auth/server-session'

export const metadata = {
  title: 'Peptora',
}

/**
 * The Peptora Pro gate. Everything under this layout needs a live access
 * window: protocols and the tracker, which is to say everything a user saves.
 *
 * Home, the library and the calculator are free and live in `(open)`, next
 * to billing and profile.
 *
 * The gate is structural rather than an allowlist of pathnames. Everything
 * that is free sits OUTSIDE this group, so there is no exception to remember
 * here and no way for a future route to be added to the wrong side of the wall
 * by accident. An allowlist is one forgotten entry away from redirecting a
 * user who has just paid into a loop with no way to tell us.
 *
 * This redirect is UX, not enforcement. The API is the enforcement: every
 * endpoint behind these screens returns 402 without access.
 *
 * getSession is React-cached, so this shares the parent layout's /auth/me call
 * rather than issuing another.
 */
export default async function ShellLayout({ children }) {
  const user = await getSession()

  if (!user) redirect('/app/auth/login')

  // Mirrors peptora-android/app/(tabs)/_layout.js. Consent comes before the
  // licence check: someone who has not accepted the terms should not be sent
  // to pay first.
  if (!user.consent_accepted) redirect('/app/consent')

  // `access.has_access` is computed by the API and never recomputed here. The
  // two clocks disagree, and a browser running fast would lock out someone
  // whose licence was approved a moment ago. A missing `access` block is
  // treated as locked — an older API build must not hand out the product.
  if (!user.access?.has_access) redirect('/app/billing')

  return <AppShell>{children}</AppShell>
}
