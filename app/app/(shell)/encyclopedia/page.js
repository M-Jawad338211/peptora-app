import { BookOpen } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = { title: 'Encyclopedia · Peptora' }

export default function BookOpenPage() {
  return (
    <EmptyState
      icon={BookOpen}
      title="Encyclopedia"
      body="Browse the peptide knowledge base. Coming in a later phase."
    />
  )
}
