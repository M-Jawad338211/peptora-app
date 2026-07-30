import { House } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = { title: 'Home · Peptora' }

export default function HousePage() {
  return (
    <EmptyState
      icon={House}
      title="Home"
      body="Your protocol overview, stats and recent doses. Coming in a later phase."
    />
  )
}
