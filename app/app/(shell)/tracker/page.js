import { ChartLine } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = { title: 'Cycle Tracker · Peptora' }

export default function ChartLinePage() {
  return (
    <EmptyState
      icon={ChartLine}
      title="Cycle Tracker"
      body="Log daily doses and review history. Coming in a later phase."
    />
  )
}
