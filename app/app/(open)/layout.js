import { redirect } from 'next/navigation'
import AppShell from '@/components/shell/AppShell'
import { getSession } from '@/lib/auth/server-session'

export const metadata = {
  title: 'Peptora',
}

/**
 * Signed in, licence not required.
 *
 * The counterpart to `(shell)`: same chrome, no licence gate. This is what a
 * user without access can still reach — the paywall itself, their payment
 * status, and enough of their profile to identify the account, contact support
 * or log out.
 *
 * Gating these would be the classic manual-billing trap: a user who has just
 * transferred money would have nowhere to tell us about it, and no way to see
 * that we already know.
 */
export default async function OpenLayout({ children }) {
  const user = await getSession()

  if (!user) redirect('/app/auth/login')
  if (!user.consent_accepted) redirect('/app/consent')

  return <AppShell>{children}</AppShell>
}
