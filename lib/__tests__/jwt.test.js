import { secondsUntilExpiry } from '../auth/jwt'

const b64url = (obj) =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const tokenWith = (payload) => `header.${b64url(payload)}.signature`

const NOW = 1_700_000_000_000 // fixed clock, ms

describe('secondsUntilExpiry', () => {
  test('returns remaining seconds for a valid token', () => {
    const exp = Math.floor(NOW / 1000) + 900 // the API issues 15-minute tokens
    expect(secondsUntilExpiry(tokenWith({ exp }), NOW)).toBe(900)
  })

  test('returns a negative value for an expired token', () => {
    const exp = Math.floor(NOW / 1000) - 60
    expect(secondsUntilExpiry(tokenWith({ exp }), NOW)).toBe(-60)
  })

  test('handles base64url padding without throwing', () => {
    // A payload whose base64 needs padding restored.
    const exp = Math.floor(NOW / 1000) + 1
    const token = tokenWith({ exp, sub: 'a'.repeat(7) })
    expect(secondsUntilExpiry(token, NOW)).toBe(1)
  })

  test('null when exp is missing', () => {
    expect(secondsUntilExpiry(tokenWith({ sub: 'user' }), NOW)).toBeNull()
  })

  test('null when exp is not a number', () => {
    expect(secondsUntilExpiry(tokenWith({ exp: 'soon' }), NOW)).toBeNull()
  })

  test('null for a malformed token', () => {
    expect(secondsUntilExpiry('not.a.jwt', NOW)).toBeNull()
    expect(secondsUntilExpiry('onlyonepart', NOW)).toBeNull()
    expect(secondsUntilExpiry('', NOW)).toBeNull()
  })

  test('null for non-string input', () => {
    expect(secondsUntilExpiry(undefined, NOW)).toBeNull()
    expect(secondsUntilExpiry(null, NOW)).toBeNull()
  })
})
