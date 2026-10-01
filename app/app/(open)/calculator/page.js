import ProtocolBuilder from '@/components/calculator/ProtocolBuilder'
import CalculatorGate from '@/components/calculator/CalculatorGate'

export const metadata = {
  title: 'Reconstitution calculator · Peptora',
  description:
    'Converts the numbers you enter between amount, volume and syringe units.',
}

export default async function CalculatorPage({ searchParams }) {
  // Lets a library entry open the calculator with its unit already chosen.
  const { peptide } = await searchParams
  return (
    <CalculatorGate>
      <ProtocolBuilder initialPeptideId={peptide ?? null} />
    </CalculatorGate>
  )
}
