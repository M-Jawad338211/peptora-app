import { Layers } from 'lucide-react'
import { getStacks } from '@/lib/api/server'
import StackList from '@/components/encyclopedia/StackList'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = {
  title: 'Stacks · Peptora',
  description:
    'Peptide stacks and blends — research pairings and commercial blend products, with each component\'s own studied dose ranges.',
}

export default async function StacksPage() {
  let stacks = []
  let failed = false

  try {
    stacks = await getStacks()
  } catch {
    failed = true
  }

  if (failed) {
    return (
      <EmptyState
        icon={Layers}
        title="Could not load stacks"
        body="The encyclopedia is temporarily unavailable. Check your connection and try again."
        action={{ label: 'Reload', href: '/app/encyclopedia/stacks' }}
      />
    )
  }

  if (stacks.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No stacks yet"
        body="The encyclopedia has no stack entries at the moment."
      />
    )
  }

  return <StackList stacks={stacks} />
}
