import { describe, expect, it } from 'vitest'
import { cryptoPaymentFromEnv } from '../crypto-payment'

describe('cryptoPaymentFromEnv', () => {
  it('returns null without any address, even when the rest is set', () => {
    expect(cryptoPaymentFromEnv({})).toBeNull()
    expect(
      cryptoPaymentFromEnv({ CRYPTO_BTC_ADDRESS: '   ', CRYPTO_BEP20_COIN: 'USDC', CRYPTO_NOTE: 'Hi' }),
    ).toBeNull()
  })

  it('lists every slot with an address, in a fixed order, trimmed', () => {
    expect(
      cryptoPaymentFromEnv({
        CRYPTO_ETH_ADDRESS: ' 0xabc ',
        CRYPTO_BTC_ADDRESS: 'bc1q',
        CRYPTO_TRC20_ADDRESS: 'TXyz',
        CRYPTO_BEP20_ADDRESS: '0xdef',
        CRYPTO_NOTE: ' Include the network fee. ',
      }),
    ).toEqual({
      wallets: [
        { key: 'BTC', coin: 'BTC', network: 'Bitcoin', address: 'bc1q' },
        { key: 'TRC20', coin: 'USDT', network: 'Tron (TRC20)', address: 'TXyz' },
        { key: 'BEP20', coin: 'USDT', network: 'BNB Smart Chain (BEP20)', address: '0xdef' },
        { key: 'ETH', coin: 'ETH', network: 'Ethereum (ERC20)', address: '0xabc' },
      ],
      note: 'Include the network fee.',
    })
  })

  it('skips slots without an address and applies a coin override', () => {
    expect(
      cryptoPaymentFromEnv({
        CRYPTO_BEP20_ADDRESS: '0xdef',
        CRYPTO_BEP20_COIN: 'USDC',
        CRYPTO_ETH_COIN: 'USDT',
      }),
    ).toEqual({
      wallets: [{ key: 'BEP20', coin: 'USDC', network: 'BNB Smart Chain (BEP20)', address: '0xdef' }],
      note: null,
    })
  })
})
