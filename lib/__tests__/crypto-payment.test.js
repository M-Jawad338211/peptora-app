import { describe, expect, it } from 'vitest'
import { cryptoPaymentFromEnv } from '../crypto-payment'

describe('cryptoPaymentFromEnv', () => {
  it('returns null without an address, even when the rest is set', () => {
    expect(cryptoPaymentFromEnv({})).toBeNull()
    expect(cryptoPaymentFromEnv({ CRYPTO_ADDRESS: '   ', CRYPTO_COIN: 'USDT' })).toBeNull()
  })

  it('reads and trims every field', () => {
    expect(
      cryptoPaymentFromEnv({
        CRYPTO_ADDRESS: ' TXyz123 ',
        CRYPTO_COIN: 'USDT',
        CRYPTO_NETWORK: 'TRC20 (Tron)',
        CRYPTO_MEMO: '42',
        CRYPTO_NOTE: 'Include the network fee.',
      }),
    ).toEqual({
      address: 'TXyz123',
      coin: 'USDT',
      network: 'TRC20 (Tron)',
      memo: '42',
      note: 'Include the network fee.',
    })
  })

  it('leaves optional fields null when blank', () => {
    expect(cryptoPaymentFromEnv({ CRYPTO_ADDRESS: 'bc1q', CRYPTO_MEMO: '' })).toEqual({
      address: 'bc1q',
      coin: null,
      network: null,
      memo: null,
      note: null,
    })
  })
})
