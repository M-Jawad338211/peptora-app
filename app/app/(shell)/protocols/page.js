import { FlaskConical } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = { title: 'Protocols · Peptora' }

export default function FlaskConicalPage() {
  return (
    <EmptyState
      icon={FlaskConical}
      title="Protocols"
      body="Save regimens and log every dose. Coming in a later phase."
    />
  )
}
