import ProtocolDetail from '@/components/protocols/ProtocolDetail'
import PlanGate from '@/components/auth/PlanGate'

export const metadata = { title: 'Protocol · Peptora' }

export default async function ProtocolPage({ params }) {
  const { id } = await params
  return (
    <PlanGate authTitle="Log in to view this protocol" title="Subscribe to view this protocol">
      <ProtocolDetail id={id} />
    </PlanGate>
  )
}
