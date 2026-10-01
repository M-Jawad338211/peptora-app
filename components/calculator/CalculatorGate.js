'use client'

import { useSession } from '@/lib/auth/session'
import { AuthPrompt } from '@/components/auth/AuthGate'
import Skeleton from '@/components/ui/Skeleton'

/**
 * The calculator is free: it is arithmetic on numbers the user types, and it
 * runs entirely in the browser. All this asks for is a signed-in account,
 * which the (open) layout has normally already checked on the server.
 *
 * What Peptora Pro adds is saving a calculation and its history. Those are
 * refused by the API without Pro (/calculator/record-use and /history both
 * answer 402) and ProtocolBuilder hides the Save button accordingly.
 */
export default function CalculatorGate({ children }) {
  const { user, isPending } = useSession()

  if (isPending) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!user) {
    return (
      <AuthPrompt
        title="Log in to use the calculator"
        subtitle="The calculator is free with a Peptora account."
      />
    )
  }

  return children
}
