'use client'

import { Coins, TriangleAlert } from 'lucide-react'
import CopyButton from '@/components/profile/CopyButton'

/**
 * The crypto alternative to the bank transfer: one row per wallet, any of
 * which can be used. The wallets come from the environment
 * (lib/crypto-payment.js), not from the API's billing config, so this section
 * only exists on deployments that set at least one CRYPTO_*_ADDRESS.
 *
 * Coin and network sit on the same row as the address on purpose: the payer
 * has to pick the matching network in their wallet, and a mismatch loses the
 * payment. Each address is copyable rather than just selectable, because it
 * is long, unforgiving and usually pasted into a phone wallet.
 */
export default function CryptoDetails({ crypto, price, currency }) {
  const priceLabel = `${currency === 'USD' ? '$' : ''}${price}${currency !== 'USD' ? ` ${currency}` : ''}`

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
        to {crypto.wallets.length > 1 ? 'any one of the addresses' : 'the address'} below,
        then submit the transaction hash and a screenshot with the form, the same
        way as a bank transfer.
      </p>

      <div className="overflow-hidden rounded border border-hairline">
        <table className="w-full table-fixed border-collapse text-left text-[13px]">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[28%]" />
            <col />
          </colgroup>
          <thead className="bg-surface">
            <tr className="font-mono text-[11px] uppercase tracking-wide text-tx3-body">
              <th scope="col" className="px-3 py-2 font-normal">Coin</th>
              <th scope="col" className="px-3 py-2 font-normal">Network</th>
              <th scope="col" className="px-3 py-2 font-normal">Address</th>
            </tr>
          </thead>
          <tbody>
            {crypto.wallets.map((w) => (
              <tr key={w.key} className="border-t border-hairline align-top">
                <th scope="row" className="px-3 py-3 font-semibold text-tx">
                  {w.coin}
                </th>
                <td className="px-3 py-3 text-tx2">{w.network}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-col items-start gap-2">
                    <code className="w-full break-all rounded bg-navy px-2 py-1.5 font-mono text-[12.5px] text-tx select-all">
                      {w.address}
                    </code>
                    <CopyButton
                      text={w.address}
                      label="Copy"
                      aria-label={`Copy the ${w.coin} ${w.network} address`}
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
          Send each coin only on the network shown on its row, and pick that same
          network in your wallet. A payment on any other coin or network cannot
          be recovered.
        </span>
      </p>
    </section>
  )
}
