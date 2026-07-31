import ProtocolBuilder from '@/components/calculator/ProtocolBuilder'

export const metadata = {
  title: 'Dose Calculator · Peptora',
  description:
    'Reconstitution and syringe dosing calculator for peptide research.',
}

export default async function CalculatorPage({ searchParams }) {
  // Lets the encyclopedia deep-link straight into a peptide's calculation.
  const { peptide } = await searchParams
  return <ProtocolBuilder initialPeptideId={peptide ?? null} />
}
