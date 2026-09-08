import Billing from '@/components/billing/Billing'

export const metadata = {
  title: 'Unlock Peptora',
  description:
    'Peptora is a one-time purchase. Pay by bank transfer, upload your receipt, and we activate your licence by hand.',
}

/**
 * Lives inside the PWA scope (/app/) and outside the licence gate.
 *
 * Both matter. Inside the scope, because an installed app opening a payment
 * page outside it pops browser chrome mid-purchase, which reads as the app
 * dumping you onto a website to take your money. Outside the gate, because
 * this is the one screen a user without a licence must always be able to
 * reach — gating it would trap a user who has already paid.
 */
export default function BillingPage() {
  return <Billing />
}
