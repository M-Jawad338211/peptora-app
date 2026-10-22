import { describe, expect, it } from 'vitest'
import { cryptoPaymentFromEnv } from '../crypto-payment'

const ALL = {
  CRYPTO_BTC_ADDRESS: ' bc1q ',
  CRYPTO_ETH_ADDRESS: '0xeth',
  CRYPTO_BEP20_ADDRESS: '0xbsc',
  CRYPTO_TRX20_ADDRESS: 'TXyz',
}

const BTC = { key: 'BTC', network: 'Bitcoin', address: 'bc1q' }
const ETH = { key: 'ETH', network: 'Ethereum (ERC20)', address: '0xeth' }
const BSC = { key: 'BEP20', network: 'BNB Smart Chain (BEP20)', address: '0xbsc' }
const TRX = { key: 'TRX20', network: 'Tron (TRX20)', address: 'TXyz' }

describe('cryptoPaymentFromEnv', () => {
  it('returns null without any address, even when the note is set', () => {
    expect(cryptoPaymentFromEnv({})).toBeNull()
    expect(cryptoPaymentFromEnv({ CRYPTO_BTC_ADDRESS: '   ', CRYPTO_NOTE: 'Hi' })).toBeNull()
  })

  it('maps each coin to the networks it can be sent on', () => {
    expect(cryptoPaymentFromEnv({ ...ALL, CRYPTO_NOTE: ' Add the fee. ' })).toEqual({
      coins: [
        { coin: 'BTC', networks: [BTC, ETH, BSC] },
        { coin: 'ETH', networks: [ETH, BSC] },
        { coin: 'BNB', networks: [BSC, ETH] },
        { coin: 'USDT', networks: [TRX, ETH, BSC] },
      ],
      note: 'Add the fee.',
    })
  })

  it('drops networks without an address, and coins left with none', () => {
    // Only Tron set: USDT is the only coin that can use it.
    expect(cryptoPaymentFromEnv({ CRYPTO_TRX20_ADDRESS: 'TXyz' })).toEqual({
      coins: [{ coin: 'USDT', networks: [TRX] }],
      note: null,
    })
    // Bitcoin missing: BTC still offered on the networks that are set.
    expect(
      cryptoPaymentFromEnv({ ...ALL, CRYPTO_BTC_ADDRESS: '' }).coins[0],
    ).toEqual({ coin: 'BTC', networks: [ETH, BSC] })
  })
})
