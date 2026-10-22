'use client'

import { useState } from 'react'
import { Coins, TriangleAlert } from 'lucide-react'
import CopyButton from '@/components/profile/CopyButton'

/**
 * The crypto alternative to the bank transfer. The payer picks a coin and
 * sees only the networks that coin can be sent on, each with its address.
 * The wallets come from the environment and the coin-to-network map from
 * lib/crypto-payment.js, so this section only exists on deployments that set
 * at least one CRYPTO_*_ADDRESS.
 *
 * Coin first, then network, because that is the order a wallet app asks in,
 * and a coin sent on a network this map does not list is lost. Each address
 * is copyable rather than just selectable: it is long, unforgiving and
 * usually pasted into a phone wallet.
 */
export default function CryptoDetails({ crypto, price, currency }) {
  const [selected, setSelected] = useState(crypto.coins[0].coin)
  const coin = crypto.coins.find((c) => c.coin === selected) ?? crypto.coins[0]
  const priceLabel = `${currency === 'USD' ? '$' : ''}${price}${currency !== 'USD' ? ` ${currency}` : ''}`
  const networkList = coin.networks.map((n) => n.network).join(', ')

  return (
    <section id="crypto-details" className="card mb-3 scroll-mt-4 p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <Coins size={16} aria-hidden="true" className="shrink-0 text-tx3-body" />
        <h2 className="font-mono text-[11px] uppercase tracking-wide text-tx3-body">
          Or pay in crypto
        </h2>
      </div>

      <p className="mb-4 text-[13px] leading-6 text-tx3-body">
        Send the equivalent of <strong className="font-semibold text-tx">{priceLabel}</strong>{' '}
        in one of these coins, then submit the transaction hash and a screenshot
        with the form, the same way as a bank transfer. Choose a coin to see
        where to send it.
      </p>

      <div role="group" aria-label="Coin" className="mb-4 flex flex-wrap gap-2">
        {crypto.coins.map((c) => {
          const active = c.coin === coin.coin
          return (
            <button
              key={c.coin}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(c.coin)}
              className={`min-h-[36px] shrink-0 rounded-full border px-4 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'border-teal/50 bg-teal/12 text-teal'
                  : 'border-hairline bg-surface text-tx2 hover:border-hairline-strong hover:text-tx'
              }`}
            >
              {c.coin}
            </button>
          )
        })}
      </div>

      <p aria-live="polite" className="mb-3 text-[13px] leading-6 text-tx3-body">
        <strong className="font-semibold text-tx">{coin.coin}</strong> can be sent on{' '}
        {coin.networks.length === 1 ? 'this network' : `these ${coin.networks.length} networks`}:{' '}
        <span className="text-tx2">{networkList}</span>.
      </p>

      <div className="overflow-hidden rounded border border-hairline">
        <table className="w-full table-fixed border-collapse text-left text-[13px]">
          <caption className="sr-only">Where to send {coin.coin}</caption>
          <colgroup>
            <col className="w-[34%]" />
            <col />
          </colgroup>
          <thead className="bg-surface">
            <tr className="font-mono text-[11px] uppercase tracking-wide text-tx3-body">
              <th scope="col" className="px-3 py-2 font-normal">Network</th>
              <th scope="col" className="px-3 py-2 font-normal">Address</th>
            </tr>
          </thead>
          <tbody>
            {coin.networks.map((n) => (
              <tr key={n.key} className="border-t border-hairline align-top">
                <th scope="row" className="px-3 py-3 font-semibold text-tx">
                  {n.network}
                </th>
                <td className="px-3 py-3">
                  <div className="flex flex-col items-start gap-2">
                    <code className="w-full break-all rounded bg-navy px-2 py-1.5 font-mono text-[12.5px] text-tx select-all">
                      {n.address}
                    </code>
                    <CopyButton
                      text={n.address}
                      label="Copy"
                      aria-label={`Copy the ${n.network} address for ${coin.coin}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {crypto.note && (
        <p className="mt-4 text-[13px] leading-6 text-tx3-body">{crypto.note}</p>
      )}

      <p className="mt-4 flex items-start gap-2.5 rounded border border-warn/30 p-3 text-[12px] leading-5 text-tx3-body">
        <TriangleAlert size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-warn" />
        <span>
          Send {coin.coin} only on a network listed above, and pick that same
          network in your wallet before you send. {coin.coin} sent on any other
          network cannot be recovered.
        </span>
      </p>
    </section>
  )
}
