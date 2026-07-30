import ProtocolDetail from '@/components/protocols/ProtocolDetail'
import AuthGate from '@/components/auth/AuthGate'

export const metadata = { title: 'Protocol · Peptora' }

export default async function ProtocolPage({ params }) {
  const { id } = await params
  return (
    <AuthGate title="Log in to view this protocol">
      <ProtocolDetail id={id} />
    </AuthGate>
  )
}
