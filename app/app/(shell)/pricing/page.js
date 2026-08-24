import Pricing from '@/components/pricing/Pricing'

export const metadata = {
  title: 'Plans · Peptora',
  description:
    'Peptora Pro — unlimited dose calculations, protocols and cycle tracking. $5 a month or $49 a year, paid in crypto.',
}

/**
 * Lives inside the PWA scope (/app/) on purpose. An installed app opening
 * /pricing outside the scope pops browser chrome mid-upgrade, which reads as
 * the app dumping you onto a website to take your money.
 */
export default function PricingPage() {
  return <Pricing />
}
