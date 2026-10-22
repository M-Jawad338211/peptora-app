/**
 * The crypto wallets shown on the Peptora Pro page, read from the environment.
 *
 * Server-only variables (no NEXT_PUBLIC_ prefix), read by the billing page's
 * Server Component and handed down as a prop, so a wallet change needs a
 * redeploy but not a code change. There are four fixed slots; a slot shows
 * only when its address is set, and any one of them can be used to pay:
 *
 *   CRYPTO_BTC_ADDRESS    BTC on Bitcoin
 *   CRYPTO_TRC20_ADDRESS  USDT on Tron (TRC20)
 *   CRYPTO_BEP20_ADDRESS  USDT on BNB Smart Chain (BEP20)
 *   CRYPTO_ETH_ADDRESS    ETH on Ethereum (ERC20)
 *
 *   CRYPTO_<SLOT>_COIN    optional, overrides the coin shown for that slot,
 *                         e.g. CRYPTO_BEP20_COIN=USDC
 *   CRYPTO_NOTE           optional, one extra line under the table
 *
 * The network names are fixed here rather than configurable, because they are
 * what the payer matches against their wallet's network picker, and a wrong
 * one sends the money somewhere unrecoverable.
 *
 * Returns null when no address is set, so a deployment without crypto
 * renders exactly as before.
 */
export const CRYPTO_SLOTS = [
  { key: 'BTC', coin: 'BTC', network: 'Bitcoin' },
  { key: 'TRC20', coin: 'USDT', network: 'Tron (TRC20)' },
  { key: 'BEP20', coin: 'USDT', network: 'BNB Smart Chain (BEP20)' },
  { key: 'ETH', coin: 'ETH', network: 'Ethereum (ERC20)' },
]

export function cryptoPaymentFromEnv(env = process.env) {
  const read = (name) => {
    const value = env[name]
    return typeof value === 'string' && value.trim() ? value.trim() : null
  }

  const wallets = CRYPTO_SLOTS.flatMap((slot) => {
    const address = read(`CRYPTO_${slot.key}_ADDRESS`)
    if (!address) return []
    return [
      {
        key: slot.key,
        coin: read(`CRYPTO_${slot.key}_COIN`) || slot.coin,
        network: slot.network,
        address,
      },
    ]
  })

  if (!wallets.length) return null
  return { wallets, note: read('CRYPTO_NOTE') }
}
