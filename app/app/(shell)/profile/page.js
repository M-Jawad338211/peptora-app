import { CircleUser } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = { title: 'Profile · Peptora' }

export default function CircleUserPage() {
  return (
    <EmptyState
      icon={CircleUser}
      title="Profile"
      body="Your account, plan and stats. Coming in a later phase."
    />
  )
}
