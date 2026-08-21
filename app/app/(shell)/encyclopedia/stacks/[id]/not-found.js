import { Layers } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export default function StackNotFound() {
  return (
    <EmptyState
      icon={Layers}
      title="Stack not found"
      body="This entry doesn't exist in the encyclopedia. It may have been renamed or removed."
      action={{ label: 'Browse stacks', href: '/app/encyclopedia/stacks' }}
    />
  )
}
