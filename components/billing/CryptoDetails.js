'use client'

import { Coins, TriangleAlert } from 'lucide-react'
import CopyButton from '@/components/profile/CopyButton'

/**
 * The crypto alternative to the bank transfer. The wallet comes from the
 * environment (lib/crypto-payment.js), not from the API's billing config, so
 * this section only exists on deployments that set CRYPTO_ADDRESS.
 *
 * The address is copyable rather than just selectable: a crypto address is
 * long, unforgiving and usually pasted into a phone wallet, where one wrong
 * character sends the money somewhere unrecoverable.
 */
export default function CryptoDetails({ crypto, price, currency }) {
  const priceLabel = `${currency === 'USD' ? '$' : ''}${price}${currency !== 'USD' ? ` ${currency}` : ''}`
  const coin = crypto.coin || 'crypto'

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
        in {coin} to the address below, then submit the transaction hash and a
        screenshot with the form, the same way as a bank transfer.
      </p>

      <dl className="flex flex-col gap-3 text-[13px]">
        {crypto.coin && (
          <div>
            <dt className="text-[12px] text-tx3-body">Coin</dt>
            <dd className="font-semibold text-tx">{crypto.coin}</dd>
          </div>
        )}
        {crypto.network && (
          <div>
            <dt className="text-[12px] text-tx3-body">Network</dt>
            <dd className="font-semibold text-tx">{crypto.network}</dd>
          </div>
        )}
        <div>
          <dt className="text-[12px] text-tx3-body">Address</dt>
          <dd className="mt-1 flex flex-col items-start gap-2">
            <code className="w-full break-all rounded bg-navy px-2 py-1.5 font-mono text-[13px] text-tx select-all">
              {crypto.address}
            </code>
            <CopyButton text={crypto.address} label="Copy address" />
          </dd>
        </div>
        {crypto.memo && (
          <div>
            <dt className="text-[12px] text-tx3-body">Memo / tag</dt>
            <dd className="mt-1 flex flex-col items-start gap-2">
              <code className="break-all rounded bg-navy px-2 py-1.5 font-mono text-[13px] text-tx select-all">
                {crypto.memo}
              </code>
              <CopyButton text={crypto.memo} label="Copy memo" />
            </dd>
          </div>
        )}
      </dl>

      {crypto.note && (
        <p className="mt-4 text-[13px] leading-6 text-tx3-body">{crypto.note}</p>
      )}

      <p className="mt-4 flex items-start gap-2.5 rounded border border-warn/30 p-3 text-[12px] leading-5 text-tx3-body">
        <TriangleAlert size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-warn" />
        <span>
          Send only {coin}
          {crypto.network ? ` on the ${crypto.network} network` : ''} to this
          address{crypto.memo ? ', and include the memo' : ''}. Anything else
          cannot be recovered.
        </span>
      </p>
    </section>
  )
}
