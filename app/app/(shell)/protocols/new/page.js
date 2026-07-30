import ProtocolForm from '@/components/protocols/ProtocolForm'
import AuthGate from '@/components/auth/AuthGate'

export const metadata = { title: 'New protocol · Peptora' }

export default async function NewProtocolPage({ searchParams }) {
  // Set by "Add as protocol" on a peptide page, so the form arrives prefilled.
  const { peptide } = await searchParams
  return (
    <AuthGate title="Log in to create a protocol">
      <ProtocolForm initialPeptideId={peptide ?? null} />
    </AuthGate>
  )
}
