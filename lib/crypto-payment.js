/**
 * The crypto wallets shown on the Peptora Pro page, read from the environment.
 *
 * Server-only variables (no NEXT_PUBLIC_ prefix), read by the billing page's
 * Server Component and handed down as a prop, so a wallet change needs a
 * redeploy but not a code change. There is one receiving address per
 * network:
 *
 *   CRYPTO_BTC_ADDRESS    the Bitcoin network address
 *   CRYPTO_ETH_ADDRESS    the Ethereum (ERC20) address
 *   CRYPTO_BEP20_ADDRESS  the BNB Smart Chain (BEP20) address
 *   CRYPTO_TRX20_ADDRESS  the Tron (TRX20) address
 *   CRYPTO_NOTE           optional, one extra line under the table
 *
 * Which coin may be sent on which network is fixed here (COINS), not
 * configurable: it is what keeps a payer from sending a coin on a network the
 * wallet does not take, which loses the payment. The page shows a coin only
 * when at least one of its networks has an address, and lists only those
 * networks.
 *
 * Returns null when no address is set, so a deployment without crypto
 * renders exactly as before.
 */
export const NETWORKS = {
  BTC: { env: 'CRYPTO_BTC_ADDRESS', name: 'Bitcoin' },
  ETH: { env: 'CRYPTO_ETH_ADDRESS', name: 'Ethereum (ERC20)' },
  BEP20: { env: 'CRYPTO_BEP20_ADDRESS', name: 'BNB Smart Chain (BEP20)' },
  TRX20: { env: 'CRYPTO_TRX20_ADDRESS', name: 'Tron (TRX20)' },
}

// Coin -> the networks it can be sent on, in the order they are listed.
export const COINS = [
  { coin: 'BTC', networks: ['BTC', 'ETH', 'BEP20'] },
  { coin: 'ETH', networks: ['ETH', 'BEP20'] },
  { coin: 'BNB', networks: ['BEP20', 'ETH'] },
  { coin: 'USDT', networks: ['TRX20', 'ETH', 'BEP20'] },
]

export function cryptoPaymentFromEnv(env = process.env) {
  const read = (name) => {
    const value = env[name]
    return typeof value === 'string' && value.trim() ? value.trim() : null
  }

  const coins = COINS.flatMap(({ coin, networks }) => {
    const options = networks.flatMap((key) => {
      const address = read(NETWORKS[key].env)
      return address ? [{ key, network: NETWORKS[key].name, address }] : []
    })
    return options.length ? [{ coin, networks: options }] : []
  })

  if (!coins.length) return null
  return { coins, note: read('CRYPTO_NOTE') }
}
