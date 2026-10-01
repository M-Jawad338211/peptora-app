import { BookOpen } from 'lucide-react'
import { getPeptides } from '@/lib/api/server'
import PeptideList from '@/components/encyclopedia/PeptideList'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = {
  title: 'Library · Peptora',
  description:
    'Peptide reference entries with mechanisms, evidence levels, regulatory status and the sources for each.',
}

/**
 * Rendered per-request because the (shell) layout reads the session cookie,
 * but the peptide fetch itself is cached for an hour (lib/api/server.js), so
 * this costs an HTML render rather than an API call.
 */
export default async function EncyclopediaPage() {
  let peptides = []
  let failed = false

  try {
    peptides = await getPeptides()
  } catch {
    // Native shows a bare red string here; give a real recovery path instead.
    failed = true
  }

  if (failed) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Could not load peptides"
        body="The library is temporarily unavailable. Check your connection and try again."
        action={{ label: 'Reload', href: '/app/encyclopedia' }}
      />
    )
  }

  if (peptides.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No peptides yet"
        body="The library has no entries at the moment."
      />
    )
  }

  return <PeptideList peptides={peptides} />
}
