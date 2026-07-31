'use client'

import { usePathname } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { useSession } from '@/lib/auth/session'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

/**
 * Signed-out prompt. Ported from peptora-android/src/lib/auth.js, with a
 * `next` param so logging in returns you to where you were — native drops you
 * on the tab root instead.
 */
export function AuthPrompt({
  title = 'Log in to continue',
  subtitle = 'Create an account or log in to access this Peptora feature.',
}) {
  const pathname = usePathname()
  const next = encodeURIComponent(pathname)

  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <LogIn
        size={44}
        strokeWidth={1.4}
        aria-hidden="true"
        className="mb-4 text-tx3"
      />
      <h2 className="mb-2 text-2xl font-bold text-tx">{title}</h2>
      <p className="mb-6 max-w-[38ch] text-sm leading-6 text-tx3-body">
        {subtitle}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button href={`/app/auth/login?next=${next}`}>Log in</Button>
        <Button href="/app/auth/signup" variant="secondary">
          Create account
        </Button>
      </div>
    </div>
  )
}

/**
 * Renders children only for a signed-in user.
 *
 * The session is seeded server-side, so `isPending` is normally false on first
 * paint and the skeleton never appears.
 */
export default function AuthGate({ children, title, subtitle }) {
  const { user, isPending } = useSession()

  if (isPending) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!user) return <AuthPrompt title={title} subtitle={subtitle} />

  return typeof children === 'function' ? children(user) : children
}
