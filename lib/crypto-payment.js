/**
 * The crypto wallet shown on the Peptora Pro page, read from the environment.
 *
 * Server-only variables (no NEXT_PUBLIC_ prefix), read by the billing page's
 * Server Component and handed down as a prop, so a wallet change needs a
 * redeploy but not a code change:
 *
 *   CRYPTO_ADDRESS  required — the receiving address. Unset hides the section.
 *   CRYPTO_COIN     e.g. "USDT"
 *   CRYPTO_NETWORK  e.g. "TRC20 (Tron)". Shown next to a warning, because
 *                   coins sent on the wrong network are lost.
 *   CRYPTO_MEMO     memo / destination tag, for networks that need one
 *   CRYPTO_NOTE     one extra line of instructions, shown under the details
 *
 * Returns null when no address is set, so a deployment without crypto
 * renders exactly as before.
 */
export function cryptoPaymentFromEnv(env = process.env) {
  const read = (name) => {
    const value = env[name]
    return typeof value === 'string' && value.trim() ? value.trim() : null
  }

  const address = read('CRYPTO_ADDRESS')
  if (!address) return null

  return {
    address,
    coin: read('CRYPTO_COIN'),
    network: read('CRYPTO_NETWORK'),
    memo: read('CRYPTO_MEMO'),
    note: read('CRYPTO_NOTE'),
  }
}
