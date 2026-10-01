'use client'

import { usePathname } from 'next/navigation'
import { Lock } from 'lucide-react'
import { useSession } from '@/lib/auth/session'
import AuthGate from '@/components/auth/AuthGate'
import Button from '@/components/ui/Button'

/**
 * Paywall prompt. The counterpart to AuthPrompt — same shape, different
 * reason — so a locked tool looks like a deliberate state rather than a
 * broken screen.
 */
export function PlanPrompt({
  title = 'This is part of Peptora Pro',
  subtitle = 'Protocols, the tracker and your history are part of Peptora Pro. The library and the calculator stay free.',
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <Lock
        size={44}
        strokeWidth={1.4}
        aria-hidden="true"
        className="mb-4 text-tx3"
      />
      <h2 className="mb-2 text-2xl font-bold text-tx">{title}</h2>
      <p className="mb-6 max-w-[38ch] text-sm leading-6 text-tx3-body">
        {subtitle}
      </p>
      <Button href={`/app/billing?next=${encodeURIComponent(pathname)}`}>
        See Peptora Pro
      </Button>
      <p className="mt-5 max-w-[40ch] text-[12px] leading-5 text-tx3-body">
        Everything you have saved stays exactly where it is.
      </p>
    </div>
  )
}

/**
 * Renders children only for a user inside a live access window.
 *
 * Composes AuthGate rather than duplicating it: signed out is a different
 * problem with a different fix, and showing a paywall to someone who simply
 * needs to log in sends them to pay for access they may already have.
 *
 * This is defence-in-depth rather than the primary gate:
 * app/app/(shell)/layout.js redirects before a page under it ever renders. It
 * still matters for client-side navigation and for a session that goes stale
 * mid-visit.
 *
 * `access.has_access` is computed by the API and never recomputed here. The
 * two clocks disagree — a browser minutes ahead of the server would paywall a
 * user who has just paid — and the server's answer is the one the endpoints
 * actually enforce.
 */
export default function PlanGate({
  children,
  title,
  subtitle,
  authTitle,
  authSubtitle,
}) {
  return (
    <AuthGate title={authTitle} subtitle={authSubtitle}>
      <PlanGateInner title={title} subtitle={subtitle}>
        {children}
      </PlanGateInner>
    </AuthGate>
  )
}

function PlanGateInner({ children, title, subtitle }) {
  const { user } = useSession()

  // AuthGate has already resolved the session, so `user` is present here.
  // Treat a missing `access` block as locked: an older API build that does not
  // send it should not silently hand out the paid tools.
  if (!user?.access?.has_access) {
    return <PlanPrompt title={title} subtitle={subtitle} />
  }

  return typeof children === 'function' ? children(user) : children
}
