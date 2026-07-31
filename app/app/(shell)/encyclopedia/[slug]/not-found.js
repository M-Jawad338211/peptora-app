import { BookOpen } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export default function PeptideNotFound() {
  return (
    <EmptyState
      icon={BookOpen}
      title="Peptide not found"
      body="This entry doesn't exist in the encyclopedia. It may have been renamed or removed."
      action={{ label: 'Browse encyclopedia', href: '/app/encyclopedia' }}
    />
  )
}
