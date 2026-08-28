import ProtocolForm from '@/components/protocols/ProtocolForm'
import PlanGate from '@/components/auth/PlanGate'

export const metadata = { title: 'New protocol · Peptora' }

export default async function NewProtocolPage({ searchParams }) {
  // Set by "Add as protocol" on a peptide or stack page, so the form arrives prefilled.
  const { peptide, stack } = await searchParams
  return (
    <PlanGate authTitle="Log in to create a protocol" title="Subscribe to create a protocol">
      <ProtocolForm initialPeptideId={peptide ?? null} initialStackId={stack ?? null} />
    </PlanGate>
  )
}
