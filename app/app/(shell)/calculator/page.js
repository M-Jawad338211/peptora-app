import { Calculator } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = { title: 'Dose Calculator · Peptora' }

export default function CalculatorPage() {
  return (
    <EmptyState
      icon={Calculator}
      title="Dose Calculator"
      body="Reconstitution and syringe dosing. Coming in a later phase."
    />
  )
}
